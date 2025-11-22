import React, { useState, useEffect } from 'react';
import { MatchingPair, AppSettings } from '../types';
import { Check, RefreshCw, Sparkles } from 'lucide-react';

interface MatchingGameProps {
  pairs: MatchingPair[];
  settings: AppSettings;
}

interface Tile {
  id: string;
  text: string;
  type: 'term' | 'definition';
  pairId: number; // The index of the pair this belongs to
  state: 'default' | 'selected' | 'matched' | 'wrong';
}

const MatchingGame: React.FC<MatchingGameProps> = ({ pairs, settings }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  const initializeGame = () => {
    const newTiles: Tile[] = [];
    pairs.forEach((pair, index) => {
      newTiles.push({
        id: `term-${index}`,
        text: pair.term,
        type: 'term',
        pairId: index,
        state: 'default'
      });
      newTiles.push({
        id: `def-${index}`,
        text: pair.definition,
        type: 'definition',
        pairId: index,
        state: 'default'
      });
    });
    
    // Shuffle
    setTiles(newTiles.sort(() => Math.random() - 0.5));
    setIsComplete(false);
    setSelectedTileId(null);
  };

  const handleTileClick = (id: string) => {
    const clickedTile = tiles.find(t => t.id === id);
    if (!clickedTile || clickedTile.state === 'matched') return;

    // If deselecting
    if (selectedTileId === id) {
      setSelectedTileId(null);
      setTiles(prev => prev.map(t => t.id === id ? { ...t, state: 'default' } : t));
      return;
    }

    // If first selection
    if (!selectedTileId) {
      setSelectedTileId(id);
      setTiles(prev => prev.map(t => t.id === id ? { ...t, state: 'selected' } : t));
      return;
    }

    // Second selection - check match
    const firstTile = tiles.find(t => t.id === selectedTileId);
    if (!firstTile) return;

    if (firstTile.pairId === clickedTile.pairId && firstTile.id !== clickedTile.id) {
      // Match found
      setTiles(prev => prev.map(t => 
        (t.id === firstTile.id || t.id === clickedTile.id) 
          ? { ...t, state: 'matched' } 
          : t
      ));
      setSelectedTileId(null);

      // Check win
      const remaining = tiles.filter(t => t.state !== 'matched').length - 2; // -2 because we just matched 2
      if (remaining <= 0) {
        setIsComplete(true);
      }
    } else {
      // Wrong match
      setTiles(prev => prev.map(t => 
        (t.id === clickedTile.id) ? { ...t, state: 'wrong' } : t
      ));
      
      setTimeout(() => {
        setTiles(prev => prev.map(t => 
          (t.id === firstTile.id || t.id === clickedTile.id) 
            ? { ...t, state: 'default' } 
            : t
        ));
        setSelectedTileId(null);
      }, 800);
    }
  };

  if (pairs.length === 0) return null;

  return (
    <div className={`bg-white rounded-xl border p-6 shadow-sm ${settings.highContrast ? 'border-black' : 'border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`font-bold flex items-center ${settings.highContrast ? 'text-black' : 'text-slate-800'}`}>
          <Sparkles className={`w-4 h-4 mr-2 ${settings.highContrast ? 'text-black' : 'text-teal-500'}`} />
          Quick Match: Active Recall
        </h4>
        <button 
          onClick={initializeGame}
          className={`p-2 rounded-full transition-colors ${settings.highContrast ? 'text-black hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-teal-600'}`}
          title="Reset Game"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isComplete ? (
        <div className="text-center py-8 animate-in fade-in zoom-in">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${settings.highContrast ? 'bg-black' : 'bg-green-100'}`}>
            <Check className={`w-6 h-6 ${settings.highContrast ? 'text-white' : 'text-green-600'}`} />
          </div>
          <p className={`font-bold ${settings.highContrast ? 'text-black' : 'text-slate-800'}`}>All Matched!</p>
          <button 
            onClick={initializeGame}
            className={`mt-3 text-sm font-medium hover:underline ${settings.highContrast ? 'text-black' : 'text-teal-600'}`}
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tiles.map(tile => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`
                p-3 rounded-lg text-sm font-medium text-left transition-all duration-200 border-2
                ${tile.state === 'default' ? (settings.highContrast ? 'bg-white border-black text-black hover:bg-slate-100' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-700') : ''}
                ${tile.state === 'selected' ? (settings.highContrast ? 'bg-black text-white border-black' : 'bg-teal-50 border-teal-500 text-teal-800 transform scale-[1.02]') : ''}
                ${tile.state === 'matched' ? (settings.highContrast ? 'bg-slate-200 text-black border-slate-400 opacity-50' : 'bg-green-50 border-green-400 text-green-800 opacity-50') : ''}
                ${tile.state === 'wrong' ? (settings.highContrast ? 'bg-white border-black text-black border-4' : 'bg-red-50 border-red-400 text-red-800 animate-pulse') : ''}
                ${tile.state === 'matched' ? 'cursor-default' : ''}
              `}
            >
              {tile.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchingGame;