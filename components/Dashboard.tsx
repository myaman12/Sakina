
import React from 'react';
import { 
  Settings, Volume2, VolumeX, Moon, Sun, Monitor, Type, Music, Shuffle, Timer,
  Power, BookOpen, HandHeart, Leaf, Mountain, Droplets, Star, Zap, Globe, Megaphone
} from 'lucide-react';
import { AppSettings, AudioMode, VisualTheme, AppLanguage } from '../types';

interface DashboardProps {
  isOpen: boolean;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  currentTheme: VisualTheme;
  themeMode: VisualTheme | 'random';
  setThemeMode: (t: VisualTheme | 'random') => void;
}

const THEME_DISPLAY_NAMES: Record<string, string> = {
  [VisualTheme.NATURE]: 'Nature', [VisualTheme.MOUNTAIN]: 'Mountain', [VisualTheme.WATER]: 'Water',
  [VisualTheme.NIGHT]: 'Night', [VisualTheme.SPACE]: 'Space', [VisualTheme.MICRO]: 'Micro', 'random': 'Random'
};

const AUDIO_MODE_DISPLAY_NAMES: Record<string, string> = {
  'adhan': 'ADHAN', 'quran': 'QURAN', 'dua': 'DUA', 'instrumental': 'MUSIC'
};

const AUDIO_ICONS: Record<string, React.ElementType> = {
  'adhan': Megaphone, 'quran': BookOpen, 'dua': HandHeart, 'instrumental': Music
};

const THEME_ICONS: Record<string, React.ElementType> = {
  [VisualTheme.NATURE]: Leaf, [VisualTheme.MOUNTAIN]: Mountain, [VisualTheme.WATER]: Droplets,
  [VisualTheme.NIGHT]: Moon, [VisualTheme.SPACE]: Star, [VisualTheme.MICRO]: Zap, 'random': Shuffle
};

const INTERVAL_OPTIONS = [
    { label: '20s', value: 20000 },
    { label: '1m', value: 60000 },
    { label: '3m', value: 180000 }
];

const AUDIO_STYLES: Record<string, { selected: string; unselected: string }> = {
  'adhan': { selected: 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_-3px_rgba(249,115,22,0.6)]', unselected: 'bg-orange-900/30 border-orange-800/50 text-orange-200/70 hover:bg-orange-800/50 hover:text-white' },
  'quran': { selected: 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_-3px_rgba(245,158,11,0.6)]', unselected: 'bg-amber-900/30 border-amber-800/50 text-amber-200/70 hover:bg-amber-800/50 hover:text-white' },
  'dua': { selected: 'bg-teal-600 border-teal-400 text-white shadow-[0_0_15px_-3px_rgba(45,212,191,0.6)]', unselected: 'bg-teal-900/30 border-teal-800/50 text-teal-200/70 hover:bg-teal-800/50 hover:text-white' },
  'instrumental': { selected: 'bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_-3px_rgba(139,92,246,0.6)]', unselected: 'bg-violet-900/30 border-violet-800/50 text-violet-200/70 hover:bg-violet-800/50 hover:text-white' }
};

const THEME_STYLES: Record<VisualTheme, { selected: string; unselected: string }> = {
  [VisualTheme.NATURE]: { selected: 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_-3px_rgba(52,211,153,0.6)]', unselected: 'bg-emerald-900/30 border-emerald-800/50 text-emerald-200/70 hover:bg-emerald-800/50 hover:text-white' },
  [VisualTheme.MOUNTAIN]: { selected: 'bg-stone-600 border-stone-400 text-white shadow-[0_0_15px_-3px_rgba(214,211,209,0.5)]', unselected: 'bg-stone-900/30 border-stone-800/50 text-stone-200/70 hover:bg-stone-800/50 hover:text-white' },
  [VisualTheme.WATER]: { selected: 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_-3px_rgba(34,211,238,0.6)]', unselected: 'bg-cyan-900/30 border-cyan-800/50 text-cyan-200/70 hover:bg-cyan-800/50 hover:text-white' },
  [VisualTheme.NIGHT]: { selected: 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_-3px_rgba(129,140,248,0.6)]', unselected: 'bg-indigo-900/30 border-indigo-800/50 text-indigo-200/70 hover:bg-indigo-800/50 hover:text-white' },
  [VisualTheme.SPACE]: { selected: 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-[0_0_15px_-3px_rgba(232,121,249,0.6)]', unselected: 'bg-fuchsia-900/30 border-fuchsia-800/50 text-fuchsia-200/70 hover:bg-fuchsia-800/50 hover:text-white' },
  [VisualTheme.MICRO]: { selected: 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_-3px_rgba(251,113,133,0.6)]', unselected: 'bg-rose-900/30 border-rose-800/50 text-rose-200/70 hover:bg-rose-800/50 hover:text-white' }
};

export const Dashboard: React.FC<DashboardProps> = ({ isOpen, settings, updateSettings, currentTheme, themeMode, setThemeMode }) => {
  return (
    <div className={`absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-white/10 transform transition-transform duration-500 ease-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 h-full flex flex-col overflow-y-auto">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
            <h2 className="text-3xl font-light text-white mb-3 tracking-[0.2em]">SAKINA</h2>
            <div className="px-2 py-0.5 border border-white/20 rounded-full mb-3">
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">v2.8.0</span>
            </div>
            <HandHeart size={24} className="text-teal-200/70 mb-3" strokeWidth={1} />
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Control Center</p>
        </div>
        <section className="mb-8">
          <h3 className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2"><Music size={16} /> Audio Ambience</h3>
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                {(['adhan', 'quran', 'dua', 'instrumental'] as const).map((mode) => {
                    const AudioIcon = AUDIO_ICONS[mode];
                    const isSelected = settings.audioMode === mode;
                    return (
                        <button key={mode} onClick={() => updateSettings({ audioMode: mode as AudioMode })} className={`px-3 py-3 text-[13px] font-bold uppercase tracking-wider rounded border transition-all flex flex-col items-center justify-center text-center gap-2 ${isSelected ? AUDIO_STYLES[mode].selected : AUDIO_STYLES[mode].unselected}`}>
                            {AudioIcon && <AudioIcon size={18} />}
                            {AUDIO_MODE_DISPLAY_NAMES[mode]}
                        </button>
                    );
                })}
             </div>
             <div className="flex items-center gap-3 mt-4">
                {settings.volume === 0 ? <VolumeX size={16} className="text-white/50"/> : <Volume2 size={16} className="text-white/50"/>}
                <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
             </div>
          </div>
        </section>
        <section className="mb-8">
            <h3 className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2"><Timer size={16} /> Shuffle Interval</h3>
            <div className="mb-4">
                 <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Video Shuffle</p>
                 <div className="flex gap-2">
                     {INTERVAL_OPTIONS.map((opt) => (
                         <button key={`vid-${opt.value}`} onClick={() => updateSettings({ videoInterval: opt.value })} className={`flex-1 py-1.5 text-[13px] font-bold rounded border transition-all ${settings.videoInterval === opt.value ? 'bg-white/10 border-white text-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50'}`}>
                            {opt.label}
                         </button>
                     ))}
                 </div>
            </div>
            <div>
                 <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Audio Shuffle</p>
                 <div className="flex gap-2">
                     {INTERVAL_OPTIONS.map((opt) => (
                         <button key={`aud-${opt.value}`} onClick={() => updateSettings({ audioInterval: opt.value })} className={`flex-1 py-1.5 text-[13px] font-bold rounded border transition-all ${settings.audioInterval === opt.value ? 'bg-white/10 border-white text-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50'}`}>
                            {opt.label}
                         </button>
                     ))}
                 </div>
            </div>
        </section>
        <section className="mb-8">
           <h3 className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2"><Monitor size={16} /> Visual Theme</h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {Object.values(VisualTheme).map((t) => (
                <button key={t} onClick={() => setThemeMode(t)} className={`px-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded border transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 ${themeMode === t ? THEME_STYLES[t].selected : THEME_STYLES[t].unselected}`}>
                    {THEME_ICONS[t] && React.createElement(THEME_ICONS[t], { size: 18 })}
                    {THEME_DISPLAY_NAMES[t]}
                </button>
            ))}
          </div>
           <button onClick={() => setThemeMode('random')} className={`w-full px-3 py-3 text-xs font-bold uppercase tracking-wider rounded border transition-all flex items-center justify-center gap-2 ${themeMode === 'random' ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-white/50 text-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50'}`}>
                <Shuffle size={14} /> {THEME_DISPLAY_NAMES['random']}
            </button>
        </section>
        <section className="mb-8">
           <h3 className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2"><Type size={16} /> Wisdom Overlay</h3>
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm text-white/80">Show Quotes</span>
             <button onClick={() => updateSettings({ showQuotes: !settings.showQuotes })} className={`w-10 h-5 rounded-full relative transition-colors ${settings.showQuotes ? 'bg-white' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${settings.showQuotes ? 'left-6' : 'left-1'}`}></div>
             </button>
          </div>
          {settings.showQuotes && (
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/40 text-xs"><Globe size={12} /><p>Language</p></div>
                <div className="flex flex-col gap-2">
                    {(['en', 'nl', 'tr'] as const).map(lang => (
                        <button key={lang} onClick={() => updateSettings({ language: lang })} className={`flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wider rounded border transition-all ${settings.language === lang ? 'bg-white/10 border-white text-white' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>
                            <span>{lang === 'en' ? 'English' : lang === 'nl' ? 'Nederlands' : 'Türkçe'}</span>
                            <span className="text-base grayscale-[0.3]">{lang === 'en' ? '🇬🇧 🇺🇸' : lang === 'nl' ? '🇳🇱' : '🇹🇷'}</span>
                        </button>
                    ))}
                </div>
             </div>
          )}
        </section>
        <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between"><span className="text-xs text-white/40">AI Curation</span><span className={`text-[10px] px-2 py-0.5 rounded-full ${settings.aiCurationLevel === 'dynamic' && themeMode !== 'random' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>{settings.aiCurationLevel === 'dynamic' && themeMode !== 'random' ? 'ACTIVE' : 'STANDARD'}</span></div>
        </div>
      </div>
    </div>
  );
};
