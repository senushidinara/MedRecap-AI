import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { GitGraph, Network } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

// Initialize mermaid settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#ccfbf1',
    primaryTextColor: '#0f172a',
    primaryBorderColor: '#0d9488',
    lineColor: '#0f766e',
    secondaryColor: '#f0f9ff',
    tertiaryColor: '#fff',
    fontFamily: 'Inter',
  },
  securityLevel: 'loose',
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (containerRef.current && chart) {
        try {
          // Clear previous content
          containerRef.current.innerHTML = '';
          
          // Generate unique ID for this diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // SANITIZATION STEP:
          // 1. Remove markdown code blocks if present
          let cleanedChart = chart.replace(/```mermaid/g, '').replace(/```/g, '').trim();
          
          // 2. Wrap text inside brackets [] in quotes if not already quoted.
          // This fixes errors like: A[Identify C7 (Vertebra Prominens)] -> fails on parens
          // Becomes: A["Identify C7 (Vertebra Prominens)"] -> works
          cleanedChart = cleanedChart.replace(/\[(.*?)\]/g, (match, content) => {
             const trimmed = content.trim();
             // If already quoted, leave it alone
             if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                 return match;
             }
             // Escape internal quotes to prevent breakage
             const safeContent = trimmed.replace(/"/g, "'");
             return `["${safeContent}"]`;
          });

          // Render
          const { svg } = await mermaid.render(id, cleanedChart);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Failed to render mermaid chart:", error);
          if (containerRef.current) {
            // Provide a fallback text or simple error message (hidden from user ideally, or subtle)
            containerRef.current.innerHTML = `
              <div class="flex flex-col items-center justify-center p-4 text-slate-400 text-xs">
                <p>Diagram could not be rendered.</p>
              </div>
            `;
          }
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm my-4">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center">
         <Network className="w-4 h-4 text-teal-600 mr-2" />
         <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Process Flow</span>
      </div>
      <div className="p-4 overflow-x-auto flex justify-center bg-white min-h-[100px]" ref={containerRef}>
         <div className="animate-pulse flex space-x-4">
           <div className="h-2 bg-slate-200 rounded w-20"></div>
           <div className="h-2 bg-slate-200 rounded w-20"></div>
         </div>
      </div>
    </div>
  );
};

export default MermaidDiagram;