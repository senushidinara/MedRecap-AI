import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Trash2, Download } from 'lucide-react';

interface DrawingBoardProps {
  sectionTitle: string;
}

const COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const DrawingBoard: React.FC<DrawingBoardProps> = ({ sectionTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  
  // Initialize and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Helper to initialize context settings
    const initContext = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    };

    const resizeObserver = new ResizeObserver(() => {
       if (container.clientWidth > 0) {
           // We only resize if the width has changed significantly to prevent
           // accidental clearing on minor layout shifts, or if it's the first load (width=0)
           if (canvas.width === 0 || Math.abs(canvas.width - container.clientWidth) > 5) {
               // Save current content
               const tempCanvas = document.createElement('canvas');
               tempCanvas.width = canvas.width;
               tempCanvas.height = canvas.height;
               const tempCtx = tempCanvas.getContext('2d');
               if (tempCtx && canvas.width > 0) {
                   tempCtx.drawImage(canvas, 0, 0);
               }

               // Resize
               canvas.width = container.clientWidth;
               canvas.height = 320; // Fixed height

               // Restore
               const ctx = canvas.getContext('2d');
               if (ctx) {
                   // Fill white first (for eraser to work properly)
                   ctx.fillStyle = '#ffffff';
                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                   
                   // Draw back old content
                   if (tempCanvas.width > 0) {
                       ctx.drawImage(tempCanvas, 0, 0);
                   }
                   initContext();
               }
           }
       }
    });

    resizeObserver.observe(container);
    initContext();

    return () => resizeObserver.disconnect();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling while drawing on touch devices
    if ('touches' in e) {
        // e.preventDefault(); 
        // Note: calling preventDefault in passive event listener (React default) might cause warning, 
        // but often needed for canvas. In React 18+ strict mode it's okay.
    }

    const { x, y } = getCoordinates(e, canvas);
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  const downloadDrawing = () => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const link = document.createElement('a');
     link.download = `sketch-${sectionTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
     link.href = canvas.toDataURL();
     link.click();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-slate-200" ref={containerRef}>
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-100">
            <div className="flex space-x-2 items-center">
                <button 
                  onClick={() => setTool('pen')}
                  className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-200'}`}
                  title="Pen"
                >
                    <Pen className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-200'}`}
                  title="Eraser"
                >
                    <Eraser className="w-4 h-4" />
                </button>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <div className="flex items-center space-x-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool('pen'); }}
                            className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c && tool === 'pen' ? 'border-slate-400 scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
            <div className="flex space-x-1">
                 <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Clear">
                    <Trash2 className="w-4 h-4" />
                 </button>
                 <button onClick={downloadDrawing} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Save Image">
                    <Download className="w-4 h-4" />
                 </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow relative bg-white cursor-crosshair touch-none">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="block"
                style={{ width: '100%', height: '320px' }} 
            />
            {/* Grid helper background (optional css pattern) */}
            <div className="absolute inset-0 pointer-events-none opacity-5" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
        </div>
    </div>
  );
};

export default DrawingBoard;
