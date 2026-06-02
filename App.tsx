
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings as SettingsIcon, Maximize2, Minimize2, User, CheckCircle2, Monitor, Music } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { AudioPlayer } from './components/AudioPlayer';
import { QuoteOverlay } from './components/QuoteOverlay';
import { InfoOverlay } from './components/InfoOverlay';
import { LocationOverlay } from './components/LocationOverlay';
import { Dashboard } from './components/Dashboard';
import { StartOverlay } from './components/StartOverlay';
import { getContent } from './services/contentService';
import { getStreamForTheme, getDroneVideo, getMusicVideo } from './services/streamService';
import {
  fetchRizaGunayContent,
  fetchAdhanContent,
  generateMahirContent,
  generateKurdiContent,
  fetchKasimiContent,
  fetchQassasContent,
  fetchDuaPlaylistContent
} from './services/audioService';
import {
  AppSettings,
  VisualTheme,
  AudioMode,
  VideoAsset,
  AudioAsset,
  Quote
} from './types';
import { VIDEO_ASSETS, AUDIO_ASSETS, DEFAULT_QUOTE, STREAM_PROVIDERS } from './constants';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    audioMode: AudioMode.ADHAN,
    volume: 0.5,
    showQuotes: true,
    quoteFrequency: 'high',
    aiCurationLevel: 'standard',
    videoInterval: 60000,
    audioInterval: 180000,
    language: 'en'
  });

  const [themeMode, setThemeMode] = useState<VisualTheme | 'random'>('random');
  const [currentTheme, setCurrentTheme] = useState<VisualTheme>(VisualTheme.NATURE);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(DEFAULT_QUOTE);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastSourceRef = useRef<string | undefined>(DEFAULT_QUOTE.source);
  const audioHistoryRef = useRef<string[]>([]);
  const audioBlacklistRef = useRef<string[]>([]);
  const videoBlacklistRef = useRef<string[]>([]);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>(AUDIO_ASSETS);

  // Unified Runtime Counters State (Seconds)
  const [elapsed, setElapsed] = useState({ v: 0, a: 0 });

  const [currentVideo, setCurrentVideo] = useState<VideoAsset>(() => {
    const themeAssets = VIDEO_ASSETS.filter(v => v.theme === VisualTheme.NATURE);
    return themeAssets.length > 0 ? themeAssets[Math.floor(Math.random() * themeAssets.length)] : VIDEO_ASSETS[0];
  });

  // --- AUDIO SELECTION LOGIC WITH ABSOLUTE PRIORITY ---
  const selectAudioForTheme = useCallback((theme: VisualTheme, mode: AudioMode, currentId?: string): AudioAsset => {
    // The reliable high-quality IDs for Qassas + Backup HQ
    const prioritizedAdhanIds = [
      'adhan_qassas_audio_com',    // <--- ABSOLUTE HIGHEST PRIORITY
      'adhan_qassas_ramadan_1440',
      'adhan_qassas_sc',
      'adhan_qassas_archive_hq',
      'adhan_madinah_hq_1',
      'adhan_madinah_hq_2'
    ];

    let candidates = audioAssets.filter(asset => asset.type === mode && !audioBlacklistRef.current.includes(asset.id));
    if (candidates.length === 0) candidates = AUDIO_ASSETS.filter(asset => asset.type === mode && !audioBlacklistRef.current.includes(asset.id));

    // ABSOLUTE PRIORITY: In Adhan mode
    if (mode === AudioMode.ADHAN) {
      const priorityPool = candidates.filter(a => prioritizedAdhanIds.includes(a.id));

      // 1. SUPER PRIORITY CHECK: 
      // Always try to play the #1 Priority (Audio.com) if it is NOT the one currently playing.
      // This effectively creates a loop where it plays every other time, or immediately upon mode switch.
      const topPriorityId = prioritizedAdhanIds[0];
      const topAsset = priorityPool.find(a => a.id === topPriorityId);

      if (topAsset && topAsset.id !== currentId) {
        return topAsset;
      }

      // 2. If #1 is playing (or missing), fall back to other priorities not in immediate history
      let nextInPriority = priorityPool.filter(a => !audioHistoryRef.current.includes(a.id) && a.id !== currentId);

      // 3. If all priorities are in history, just pick any valid priority that isn't current
      if (nextInPriority.length === 0) {
        nextInPriority = priorityPool.filter(a => a.id !== currentId);
      }

      if (nextInPriority.length > 0) {
        // Sort by priority index to respect the preference order
        const bestNext = nextInPriority.sort((a, b) =>
          prioritizedAdhanIds.indexOf(a.id) - prioritizedAdhanIds.indexOf(b.id)
        )[0];
        return bestNext;
      }

      // Fallback to random if priority logic exhausted
      if (priorityPool.length > 0) return priorityPool[Math.floor(Math.random() * priorityPool.length)];
    }

    if (mode === AudioMode.DUA) {
      // --- DUA SEQUENCE LOGIC: Cevsen -> Sekine -> Random ---

      // Find current audio object
      const currentAsset = audioAssets.find(a => a.id === currentId) || AUDIO_ASSETS.find(a => a.id === currentId);

      // 1. If no current DUA track or starting fresh, play Cevsen first
      if (!currentAsset || currentAsset.type !== AudioMode.DUA) {
        const cevsen = audioAssets.find(a =>
          (a.title.toLowerCase().includes('cevsen') || a.title.toLowerCase().includes('cevşen'))
          && a.type === AudioMode.DUA
        ) || AUDIO_ASSETS.find(a => a.id === 'dua_cevsen_riza');
        if (cevsen) return cevsen;
      }

      // 2. If current was Cevsen, play Sekine next
      if (currentAsset && (currentAsset.title.toLowerCase().includes('cevsen') || currentAsset.title.toLowerCase().includes('cevşen'))) {
        const sekine = audioAssets.find(a =>
          a.title.toLowerCase().includes('sekine') && a.artist.includes('Rıza') && a.type === AudioMode.DUA
        );
        if (sekine) return sekine;
      }

      const QURAN_KEYWORDS = ["sure", "surah", "ayat", "ayet", "tilavet", "recitation", "huvallahullezi", "amenerrasulu"];
      candidates = candidates.filter(c => !QURAN_KEYWORDS.some(kw => c.title.toLowerCase().includes(kw)));
    }

    if (candidates.length === 0) return AUDIO_ASSETS.find(a => a.type === mode) || AUDIO_ASSETS[0];

    let pool = candidates.filter(a => !audioHistoryRef.current.includes(a.id) && a.id !== currentId);
    if (pool.length === 0) pool = candidates.filter(a => a.id !== currentId);
    if (pool.length === 0) pool = candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [audioAssets]);

  // INITIAL STATE: Strictly enforce Qassas Priorities
  const [currentAudio, setCurrentAudio] = useState<AudioAsset>(() => {
    // Try Audio.com First
    const audioCom = AUDIO_ASSETS.find(a => a.id === 'adhan_qassas_audio_com');
    if (audioCom) return audioCom;

    // Try Ramadan 1440 
    const ramadan = AUDIO_ASSETS.find(a => a.id === 'adhan_qassas_ramadan_1440');
    if (ramadan) return ramadan;

    const sc = AUDIO_ASSETS.find(a => a.id === 'adhan_qassas_sc');
    if (sc) return sc;

    const hq = AUDIO_ASSETS.find(a => a.id === 'adhan_qassas_archive_hq');
    if (hq) return hq;

    // Fallback to others
    const prioritizedIds = ['adhan_madinah_hq_1', 'adhan_madinah_hq_2', 'adhan_madinah_hq_3'];
    const candidates = AUDIO_ASSETS.filter(a => prioritizedIds.includes(a.id));
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : AUDIO_ASSETS[0];
  });

  const [displayArtist, setDisplayArtist] = useState(currentAudio.artist);
  const [isArtistFading, setIsArtistFading] = useState(false);

  // --- STABLE REFS ---
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const currentThemeRef = useRef(currentTheme);
  useEffect(() => { currentThemeRef.current = currentTheme; }, [currentTheme]);

  const currentVideoRef = useRef(currentVideo);
  useEffect(() => { currentVideoRef.current = currentVideo; }, [currentVideo]);

  const currentAudioRef = useRef(currentAudio);
  useEffect(() => {
    currentAudioRef.current = currentAudio;
    if (!audioHistoryRef.current.includes(currentAudio.id)) {
      audioHistoryRef.current = [...audioHistoryRef.current.slice(-30), currentAudio.id];
    }
  }, [currentAudio]);

  const themeModeRef = useRef(themeMode);
  useEffect(() => { themeModeRef.current = themeMode; }, [themeMode]);

  // --- HANDLERS ---
  const triggerVideoChange = useCallback(async () => {
    if (themeModeRef.current === 'random') {
      const themes = Object.values(VisualTheme);
      const currentIndex = themes.indexOf(currentThemeRef.current);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setCurrentTheme(nextTheme);
    } else {
      const video = await getStreamForTheme(currentThemeRef.current, currentVideoRef.current.id, settingsRef.current.audioMode, videoBlacklistRef.current);
      setCurrentVideo(video);
    }
  }, []);

  const triggerAudioChange = useCallback(() => {
    const nextAudio = selectAudioForTheme(currentThemeRef.current, settingsRef.current.audioMode, currentAudioRef.current.id);
    setCurrentAudio(nextAudio);
  }, [selectAudioForTheme]);

  // Reset counters when shuffle intervals change
  const prevVideoIntervalRef = useRef(settings.videoInterval);
  const prevAudioIntervalRef = useRef(settings.audioInterval);
  useEffect(() => {
    if (prevVideoIntervalRef.current !== settings.videoInterval) {
      prevVideoIntervalRef.current = settings.videoInterval;
      setElapsed(prev => ({ ...prev, v: 0 }));
    }
    if (prevAudioIntervalRef.current !== settings.audioInterval) {
      prevAudioIntervalRef.current = settings.audioInterval;
      setElapsed(prev => ({ ...prev, a: 0 }));
    }
  }, [settings.videoInterval, settings.audioInterval]);

  // --- ENGINE ---
  useEffect(() => {
    if (!hasStarted || isUserPaused) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const videoThreshold = settingsRef.current.videoInterval / 1000;
        const audioThreshold = settingsRef.current.audioInterval / 1000;
        const nextV = prev.v + 1;
        const nextA = prev.a + 1;
        const shouldVideoShuffle = nextV >= videoThreshold;
        const shouldAudioShuffle = nextA >= audioThreshold;
        if (shouldVideoShuffle) triggerVideoChange();
        if (shouldAudioShuffle) triggerAudioChange();
        return {
          v: shouldVideoShuffle ? 0 : nextV,
          a: shouldAudioShuffle ? 0 : nextA
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isUserPaused, triggerVideoChange, triggerAudioChange]);

  // --- REACTIONARY EFFECTS ---
  const refreshQuote = useCallback(async (video: VideoAsset, audio: AudioAsset) => {
    const content = await getContent(
      settings.aiCurationLevel,
      new Date().toLocaleTimeString(),
      video.theme,
      settings.language,
      audio,
      video,
      lastSourceRef.current
    );
    if (content && content.quote) {
      setCurrentQuote(content.quote);
      lastSourceRef.current = content.quote.source;
    }
  }, [settings.aiCurationLevel, settings.language]);

  useEffect(() => {
    if (hasStarted) {
      setIsArtistFading(true);
      const timer = setTimeout(() => {
        setDisplayArtist(currentAudio.artist);
        setIsArtistFading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentAudio.id, hasStarted]);

  // Switch Mode Effect
  const prevAudioModeRef = useRef<AudioMode>(settings.audioMode);
  useEffect(() => {
    if (!hasStarted) return;

    const prevMode = prevAudioModeRef.current;
    const isModeChange = prevMode !== settings.audioMode;

    // Only process if mode actually changed
    if (!isModeChange) return;

    prevAudioModeRef.current = settings.audioMode;

    // When switching TO MUSIC (INSTRUMENTAL): video = müzik playlist (video+ses tek player),
    // ayrı AudioPlayer render edilmez. Video'yu müzik videosuna zorla.
    if (settings.audioMode === AudioMode.INSTRUMENTAL) {
      getMusicVideo(currentVideoRef.current.id, videoBlacklistRef.current).then(video => {
        if (video) {
          setCurrentVideo(video);
          setElapsed(prev => ({ ...prev, v: 0 }));
        }
      });
      // currentAudio'yu da güncelle (UI tutarlılığı; AudioPlayer MUSIC'te render edilmez)
      setCurrentAudio(selectAudioForTheme(currentTheme, settings.audioMode));
      setElapsed(prev => ({ ...prev, a: 0 }));
      return;
    }

    // When switching TO Quran mode, force start with Surah An-Nur by Muhammed Al-Kurdi
    if (settings.audioMode === AudioMode.QURAN) {
      const nurSurah: AudioAsset = {
        id: 'quran_kurdi_024',
        url: 'https://server6.mp3quran.net/kurdi/024.mp3',
        type: AudioMode.QURAN,
        title: 'Surah An-Nur',
        artist: 'Muhammed Al-Kurdi'
      };
      setCurrentAudio(nurSurah);
      setElapsed(prev => ({ ...prev, a: 0 }));

      // Special Request: When Quran starts with Surah Nur, bring the Highest Rated Drone Nature Video
      if (currentTheme !== VisualTheme.NATURE) {
        setCurrentTheme(VisualTheme.NATURE);
      }

      // Force fetch a random high-quality drone video for Nature
      getDroneVideo(VisualTheme.NATURE).then(video => {
        if (video) {
          setCurrentVideo(video);
          setElapsed(prev => ({ ...prev, v: 0 }));
        }
      });

      return;
    }

    // When switching TO DUA mode, force start with Cevşen-ül Kebir
    if (settings.audioMode === AudioMode.DUA) {
      const cevsen = audioAssets.find(a =>
        (a.title.toLowerCase().includes('cevsen') || a.title.toLowerCase().includes('cevşen'))
        && a.type === AudioMode.DUA
      ) || AUDIO_ASSETS.find(a => a.id === 'dua_cevsen_riza');

      if (cevsen) {
        setCurrentAudio(cevsen);
        setElapsed(prev => ({ ...prev, a: 0 }));
        return;
      }
    }

    // For all other mode changes (ADHAN, etc.)
    const newAudio = selectAudioForTheme(currentTheme, settings.audioMode);
    setCurrentAudio(newAudio);
    setElapsed(prev => ({ ...prev, a: 0 }));

    // MUSIC'ten çıkış: aktif müzik videosunu tema videosuyla değiştir (müzik video bg kalmasın).
    if (prevMode === AudioMode.INSTRUMENTAL) {
      getStreamForTheme(currentTheme, currentVideoRef.current.id, settings.audioMode, videoBlacklistRef.current).then(video => {
        if (video) {
          setCurrentVideo(video);
          setElapsed(prev => ({ ...prev, v: 0 }));
        }
      });
    }
    // Note: intentionally omitting selectAudioForTheme from dependency array to prevent overrides on background data load
  }, [settings.audioMode, currentTheme, hasStarted, audioAssets, selectAudioForTheme]);

  useEffect(() => {
    if (!hasStarted) return;
    const updateVideo = async () => {
      const video = await getStreamForTheme(currentTheme, currentVideo.id, settings.audioMode, videoBlacklistRef.current);
      setCurrentVideo(video);
      setElapsed(prev => ({ ...prev, v: 0 }));
    };
    updateVideo();
  }, [currentTheme]);

  useEffect(() => {
    if (!hasStarted) return;
    refreshQuote(currentVideo, currentAudio);
  }, [currentVideo.id, currentAudio.id, refreshQuote, hasStarted]);

  // --- DYNAMIC ASSET LOADING ---
  useEffect(() => {
    const loadDynamicAudio = async () => {
      const kurdiContent = generateKurdiContent();
      const mahirContent = generateMahirContent();

      // Added fetchQassasContent to the Promise.all array
      const [rizaContent, adhanContent, kasimiContent, qassasContent, duaPlaylistContent] = await Promise.all([
        fetchRizaGunayContent(),
        fetchAdhanContent(),
        fetchKasimiContent(),
        fetchQassasContent(),
        fetchDuaPlaylistContent()
      ]);

      setAudioAssets(prev => {
        let newAssets = [...prev];
        if (rizaContent.length > 0) newAssets = [...newAssets.filter(a => a.artist !== 'Rıza Günay'), ...rizaContent];
        if (kasimiContent.length > 0) newAssets = [...newAssets.filter(a => a.artist !== 'Ahmed Ebül Kasımi'), ...kasimiContent];
        if (mahirContent.length > 0) newAssets = [...newAssets.filter(a => a.artist !== 'Mahir Al-Muaiqly'), ...mahirContent];
        if (kurdiContent.length > 0) newAssets = [...newAssets.filter(a => a.artist !== 'Muhammed Al-Kurdi'), ...kurdiContent];

        // Integrate Qassas Dynamic Content
        if (qassasContent.length > 0) {
          // Prevent duplicates with hardcoded constants
          const existingIds = newAssets.map(a => a.id);
          const uniqueQassas = qassasContent.filter(a => !existingIds.includes(a.id));
          newAssets = [...newAssets, ...uniqueQassas];
        }

        // Ensure we don't accidentally overwrite our high-quality constants with lower quality generic fetches
        if (adhanContent.length > 0) {
          newAssets = [...newAssets, ...adhanContent.filter(a => !a.id.startsWith('adhan_madinah_hq_') && !a.id.startsWith('adhan_qassas_'))];
        }

        // DUA YouTube playlist — havuza EKLE (sona; arşiv Cevşen forced-start için ilk sırada kalsın).
        // dedupe: aynı dua_yt_ id'leri tekrar eklenmesin.
        if (duaPlaylistContent.length > 0) {
          const existingIds = new Set(newAssets.map(a => a.id));
          newAssets = [...newAssets, ...duaPlaylistContent.filter(a => !existingIds.has(a.id))];
        }
        return newAssets;
      });
    };
    loadDynamicAudio();
  }, []);

  const handleVideoError = useCallback(async () => {
    if (currentVideo?.id) videoBlacklistRef.current = [...videoBlacklistRef.current, currentVideo.id];
    const nextVideo = await getStreamForTheme(currentTheme, currentVideo.id, settings.audioMode, videoBlacklistRef.current);
    setCurrentVideo(nextVideo);
    setElapsed(prev => ({ ...prev, v: 0 }));
  }, [currentTheme, currentVideo.id, settings.audioMode]);

  const handleAudioError = useCallback(() => {
    console.warn("Audio playback failed for:", currentAudio.id, currentAudio.url);
    if (currentAudio?.id) audioBlacklistRef.current = [...audioBlacklistRef.current, currentAudio.id];
    setCurrentAudio(selectAudioForTheme(currentTheme, settings.audioMode, currentAudio.id));
    setElapsed(prev => ({ ...prev, a: 0 }));
  }, [currentAudio, currentTheme, settings.audioMode, selectAudioForTheme]);

  const handleStart = () => {
    setHasStarted(true);
    setShowUpdateToast(true);
    setTimeout(() => setShowUpdateToast(false), 5000);
    toggleFullscreen();
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  }, []);

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'source';
    }
  };

  const uiVisible = (!isIdle || isDashboardOpen) && hasStarted;
  const providerName = STREAM_PROVIDERS[currentVideo.providerId]?.displayName || 'Unknown';
  // MUSIC modu: video sesli çalar (tek player), ayrı AudioPlayer susturulur (çift-ses yok).
  const isMusicMode = settings.audioMode === AudioMode.INSTRUMENTAL;

  const handleScreenClick = useCallback(() => {
    if (hasStarted && !isDashboardOpen) {
      setIsUserPaused(prev => !prev);
    }
  }, [hasStarted, isDashboardOpen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none" onClick={handleScreenClick}>
      {!hasStarted && <StartOverlay onStart={handleStart} />}
      <VideoPlayer
        asset={currentVideo}
        isPaused={isDashboardOpen || isUserPaused}
        onError={handleVideoError}
        muted={!isMusicMode}
        volume={settings.volume}
      />
      {hasStarted && !isMusicMode && (
        <AudioPlayer
          key={`${settings.audioMode}-${currentAudio.id}`}
          asset={currentAudio}
          mode={settings.audioMode}
          isPlaying={!isUserPaused}
          volume={settings.volume}
          onError={handleAudioError}
        />
      )}

      {showUpdateToast && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-white tracking-widest uppercase">Sakina v2.8 (Sheikh Qassas Edition)</span>
          </div>
        </div>
      )}

      <div className={`transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        <InfoOverlay visible={true} />
        <LocationOverlay location={currentVideo.description} theme={currentTheme} videoId={currentVideo.id} audioMode={settings.audioMode} providerName={providerName} isSurreal={currentVideo.isSurreal} quality={currentVideo.quality} />
        <QuoteOverlay quote={currentQuote} visible={settings.showQuotes} theme={currentTheme} />
      </div>

      {hasStarted && (
        <div className={`absolute right-4 md:right-8 2xl:right-16 z-40 flex flex-col items-end text-right transition-opacity duration-1000 ${isArtistFading ? 'opacity-0' : 'opacity-100'} top-[calc(1.5rem+42px)] md:top-[calc(2rem+44px)] 2xl:top-[calc(4rem+102px)]`}>
          <span className="text-[8px] md:text-[10px] 2xl:text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-0.5">{isMusicMode ? 'Now Playing' : 'Reciter'}</span>
          <div className="flex items-center gap-2 text-white/90 text-[11px] md:text-sm 2xl:text-2xl font-light">
            {isMusicMode ? <Music size={14} className="opacity-50" /> : <User size={14} className="opacity-50" />}
            <span>{isMusicMode ? 'Classical Music' : displayArtist}</span>
          </div>
          <div className="text-[9px] md:text-[10px] 2xl:text-sm text-white/40 font-medium mt-0.5 mb-2 flex items-center justify-end gap-2">
            <span>{isMusicMode ? currentVideo.description : currentAudio.title}</span>
            <span className="opacity-30">|</span>
            <span>{isMusicMode ? 'youtube.com' : getHostname(currentAudio.url)}</span>
          </div>

          {/* Runtime Counters */}
          <div className="flex items-center gap-4 text-[11px] md:text-sm 2xl:text-base font-mono font-bold text-white/40 mt-1">
            <div className="flex items-center gap-1.5" title="Video Countdown">
              <Monitor size={14} className="opacity-50" />
              <span>{Math.max(0, Math.floor(settings.videoInterval / 1000) - elapsed.v)}s</span>
            </div>
            <div className="flex items-center gap-1.5" title="Audio Countdown">
              <Music size={14} className="opacity-50" />
              <span>{Math.max(0, Math.floor(settings.audioInterval / 1000) - elapsed.a)}s</span>
            </div>
          </div>
        </div>
      )}

      <div className={`absolute top-6 right-4 md:top-8 md:left-auto md:right-8 2xl:top-16 2xl:right-16 z-40 flex items-center gap-4 transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleFullscreen} className="p-2 md:p-3 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:bg-white/20 border border-white/10">
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button onClick={() => setIsDashboardOpen(true)} className="p-2 md:p-3 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:bg-white/20 border border-white/10">
          <SettingsIcon size={20} />
        </button>
      </div>

      <div className={`absolute inset-0 z-50 pointer-events-none ${isDashboardOpen ? 'bg-black/50 backdrop-blur-sm pointer-events-auto' : ''} transition-colors duration-500`} onClick={() => setIsDashboardOpen(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <Dashboard isOpen={isDashboardOpen} settings={settings} updateSettings={(s) => setSettings({ ...settings, ...s })} currentTheme={currentTheme} themeMode={themeMode} setThemeMode={(m) => { setThemeMode(m); if (m !== 'random') setCurrentTheme(m); }} />
        </div>
      </div>
    </div>
  );
};

export default App;
