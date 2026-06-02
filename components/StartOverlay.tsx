import React from 'react';
import { Play } from 'lucide-react';

interface StartOverlayProps {
  onStart: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <button 
        onClick={onStart}
        className="group relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-500 ease-out"
      >
        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-50"></div>
        <Play className="w-8 h-8 md:w-12 md:h-12 text-white fill-white ml-2 opacity-90 group-hover:opacity-100" />
        <span className="absolute -bottom-10 text-white/60 text-xs tracking-[0.3em] uppercase">Enter Sakina</span>
      </button>
    </div>
  );
};