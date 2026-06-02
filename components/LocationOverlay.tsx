
import { VisualTheme, AudioMode } from '../types';
import React, { useState, useEffect } from 'react';

interface LocationOverlayProps {
  location: string;
  theme: VisualTheme;
  videoId: string; // Forces updates on video change
  audioMode: AudioMode;
  providerName: string;
  isSurreal?: boolean;
  quality?: string;
}

export const LocationOverlay: React.FC<LocationOverlayProps> = ({ 
  location, 
  theme, 
  videoId, 
  audioMode, 
  providerName,
  isSurreal,
  quality
}) => {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setIsFading(true);
    const timeout = setTimeout(() => {
      setDisplayLocation(location);
      setIsFading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [videoId, location]);

  // Determine Category Label
  // NOTE: In sacred/contemplative modes the actual video query is overridden by
  // streamService (customQuery), so asset.theme no longer reflects the on-screen
  // content. Derive the label from audioMode in those modes instead of the stale
  // base theme — otherwise a mosque video can show "Mountain - Surreal".
  const isSacred = audioMode === AudioMode.ADHAN || audioMode === AudioMode.QURAN;
  const isDua = audioMode === AudioMode.DUA;
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
  const surrealTag = isSurreal ? ' - Surreal' : '';

  // Format Provider Name (Simplified)
  const cleanProviderName = providerName.replace(' Aerials', '');
  const categoryLabel = isSacred ? 'Sacred' : isDua ? 'Celestial' : `${themeName}${surrealTag}`;
  
  // Format: "Repository - Category" (e.g., Apple - Water)
  const fullLabel = `${cleanProviderName} - ${categoryLabel}`;

  // Parsing & Wrapping Logic
  const parts = displayLocation.split(',');
  const mainInfo = parts[0].trim();
  const subInfo = parts.length > 1 ? parts.slice(1).join(',').trim() : null;

  // Prepare Main Text Lines
  const words = mainInfo.split(/\s+/);
  const MAX_WORDS_PER_LINE = 4;
  const MAX_TOTAL_LINES = 3;

  const mainLines: string[] = [];
  let currentLineWords: string[] = [];

  words.forEach(word => {
    if (currentLineWords.length < MAX_WORDS_PER_LINE) {
      currentLineWords.push(word);
    } else {
      mainLines.push(currentLineWords.join(' '));
      currentLineWords = [word];
    }
  });
  if (currentLineWords.length > 0) mainLines.push(currentLineWords.join(' '));

  // Limit Lines
  const subInfoLinesCount = subInfo ? 1 : 0;
  const maxMainLines = MAX_TOTAL_LINES - subInfoLinesCount;
  const visibleMainLines = mainLines.slice(0, maxMainLines);
  
  if (mainLines.length > maxMainLines && visibleMainLines.length > 0) {
      const lastIdx = visibleMainLines.length - 1;
      visibleMainLines[lastIdx] = visibleMainLines[lastIdx].replace(/\.?$/, '...');
  }

  // Font Size Logic
  const isSingleLine = visibleMainLines.length === 1 && !subInfo;
  const fontSizeClass = isSingleLine 
    ? 'text-lg md:text-2xl 2xl:text-5xl' 
    : 'text-base md:text-xl 2xl:text-4xl';

  return (
    <div 
      className={`absolute bottom-5 landscape:bottom-3 left-6 md:bottom-14 md:left-8 md:landscape:bottom-6 2xl:bottom-24 2xl:left-16 z-30 pointer-events-none text-left transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
       <div className="flex flex-col items-start drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-l-2 border-white/40 pl-3 md:pl-4">
          
          {/* Repository & Category Label: Repository - Category + Quality Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] md:text-xs 2xl:text-sm font-bold uppercase tracking-[0.3em] text-white/70">
              {fullLabel}
            </span>
            {quality && (
              <span className="px-1 py-0.5 border border-white/30 rounded-[2px] text-[7px] md:text-[8px] 2xl:text-xs font-black text-white/60 leading-none">
                {quality}
              </span>
            )}
          </div>

          {/* Main Lines */}
          <div className={`${fontSizeClass} font-light tracking-wide font-sans leading-tight text-white flex flex-col`}>
             {visibleMainLines.map((line, idx) => (
                 <span key={idx}>{line}</span>
             ))}
          </div>
          
          {/* Sub Info */}
          {subInfo && (
            <span className="text-[10px] md:text-xs 2xl:text-xl font-semibold uppercase tracking-[0.15em] text-white/80 mt-1.5 truncate max-w-[300px] md:max-w-[400px]">
              {subInfo}
            </span>
          )}
       </div>
    </div>
  );
};
