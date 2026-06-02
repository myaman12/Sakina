
import React, { useEffect, useState } from 'react';
import { Quote, VisualTheme } from '../types';

interface QuoteOverlayProps {
  quote: Quote | null;
  visible: boolean;
  theme: VisualTheme;
}

export const QuoteOverlay: React.FC<QuoteOverlayProps> = ({ quote, visible, theme }) => {
  const [displayQuote, setDisplayQuote] = useState<Quote | null>(quote);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (quote !== displayQuote) {
      setIsFading(true);
      const timeout = setTimeout(() => {
        setDisplayQuote(quote);
        setIsFading(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [quote, displayQuote]);

  if (!displayQuote) return null;

  const words = displayQuote.text_en.trim().split(/\s+/);
  const wordCount = words.length;
  const isShortQuote = wordCount <= 5;

  let renderLines: string[] = [displayQuote.text_en];

  if (wordCount > 5 && (displayQuote.type === 'scholar' || displayQuote.type === 'quran')) {
    const chunks: string[] = [];
    const WORDS_PER_LINE = 6;
    for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
      chunks.push(words.slice(i, i + WORDS_PER_LINE).join(' '));
    }
    renderLines = chunks;
  }

  return (
    <div className={`absolute bottom-5 landscape:bottom-3 right-4 left-4 md:left-auto md:bottom-14 md:landscape:bottom-6 md:right-8 2xl:bottom-24 2xl:right-16 landscape:right-5 max-w-full md:max-w-xl lg:max-w-2xl 2xl:max-w-4xl z-10 transition-opacity duration-1000 pointer-events-none ${visible && !isFading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] text-right flex flex-col items-end">
        {displayQuote.text_ar && (
          <p className="mb-4 text-xl md:text-2xl 2xl:text-4xl leading-loose text-white" style={{ fontFamily: "'Amiri', serif" }} dir="rtl">
            {displayQuote.text_ar}
          </p>
        )}
        <div className={`font-sans text-white flex flex-col items-end text-right ${isShortQuote ? 'text-2xl md:text-3xl lg:text-4xl 2xl:text-6xl font-light leading-tight tracking-tight' : 'text-lg md:text-xl lg:text-2xl 2xl:text-4xl font-light leading-relaxed tracking-wide'}`}>
          {renderLines.map((line, idx) => {
            let content = line;
            if (renderLines.length === 1) {
              content = `"${line}"`;
            } else {
              if (idx === 0) content = `"${line}`;
              if (idx === renderLines.length - 1) content = `${line}"`;
            }
            return <p key={idx} className={idx > 0 ? "mt-1 md:mt-2" : ""}>{content}</p>;
          })}
        </div>
        <div className="mt-3 md:mt-4 2xl:mt-6 border-t border-white/40 pt-2 inline-block">
          <p className="text-[10px] md:text-xs 2xl:text-sm font-bold uppercase tracking-[0.25em] text-white/80">{displayQuote.source}</p>
        </div>
      </div>
    </div>
  );
};
