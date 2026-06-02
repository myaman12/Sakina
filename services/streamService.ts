
import { VideoAsset, VisualTheme, AudioMode } from '../types';
import { VIDEO_ASSETS } from '../constants';
import { fetchPexelsVideos } from './pexelsService';
import { fetchPixabayVideos } from './pixabayService';
import { fetchAppleAerialsVideos } from './appleAerialsService';
import { fetchYouTubeVideos } from './youtubeService';

// --- CONTENT FILTERING ---
const BLACKLIST_TERMS = [
    'woman', 'women', 'girl', 'female', 'lady', 'bikini', 'model', 'fashion',
    'rocket', 'spaceship', 'shuttle', 'satellite', 'station', 'astronaut', 'iss', 'nasa', 'equipment',
    'car', 'bus', 'truck', 'vehicle', 'train', 'airplane', 'plane', 'aircraft', 'jet',
    'traffic', 'road', 'highway', 'freeway', 'motorcycle', 'bike', 'ship', 'boat', 'yacht',
    'city', 'urban', 'skyscraper', 'metropolis', 'downtown', 'apartment', 'condo',
    'office building', 'street', 'town', 'modern building', 'cityscape',
    'cell phone', 'mobile phone', 'smartphone',
    'muslim beach', 'burkini'
];

const validateAsset = (asset: VideoAsset): boolean => {
    const textToCheck = `${asset.description} ${asset.id} ${asset.theme}`.toLowerCase();
    for (const term of BLACKLIST_TERMS) {
        if (textToCheck.includes(term)) return false; 
    }
    return true;
};

// --- Scoring Logic: Extreme priority for 4K & Surreal Wonders ---
export const calculateAssetScore = (asset: VideoAsset, audioMode?: AudioMode): number => {
    let score = asset.rating || 50;
    const desc = asset.description.toLowerCase();
    const id = asset.id.toLowerCase();

    // 1. RESOLUTION PRIORITY (The most important factor)
    if (asset.quality === '4K') {
        score += 2000; // Massive boost to ensure 4K always beats HD
    } else {
        score -= 100; // Slight penalty for non-4K
    }

    // 2. VISUAL STYLE PRIORITY (Mode-Dependent)
    if (asset.isSurreal) {
        // Surreal videos get MASSIVE boost in Dua mode for contemplative atmosphere
        if (audioMode === AudioMode.DUA) {
            score += 300; // Triple the standard surreal bonus in Dua mode
        } else if (audioMode === AudioMode.ADHAN) {
            // Do NOT boost surreal in Adhan mode - sacred visuals take priority
            score += 0;
        } else {
            score += 100; // Standard bonus for other modes
        }
    }

    // 3. PROVIDER QUALITY
    if (asset.providerId === 'apple_aerials') score += 50; // Apple usually has highest bitrate

    // 4. THEMATIC KEYWORDS
    const highPriorityTerms = [
      'volcano', 'lava', 'underwater', 'deep sea', 'nebula', 'galaxy',
      'massive waves', 'tsunami', 'enchanted forest', 'magical forest',
      'bioluminescent', 'northern lights', 'aurora', 'storm clouds', 'magma', 'coral reef',
      // Spiritual High Priority (takes precedence over surreal in Adhan mode)
      'mosque', 'calligraphy', 'bursa', 'ulu cami', 'kaaba', 'madinah', 'aqsa', 'islamic art',
      // Drone/Aerial High Priority
      'drone', 'aerial', 'fpv', 'bird eye', 'top down', 'cinematic flight'
    ];

    if (highPriorityTerms.some(term => desc.includes(term) || id.includes(term))) {
      score += 150;
    }

    return score;
};

export const getDroneVideo = async (theme: VisualTheme): Promise<VideoAsset> => {
    let candidates: VideoAsset[] = [];
    
    // Use varied queries to get a broader mix of drone content
    const droneQueries = [
        "cinematic drone nature 4k",
        "aerial view nature 4k", 
        "fpv drone nature 4k",
        "birds eye view forest 4k",
        "drone landscape 4k"
    ];
    const selectedQuery = droneQueries[Math.floor(Math.random() * droneQueries.length)];

    // Fetch specifically targeting drone content
    const fetchers = [
        { name: 'youtube', fn: () => fetchYouTubeVideos(theme) },
        { name: 'pexels', fn: () => fetchPexelsVideos(theme, selectedQuery) },
        { name: 'pixabay', fn: () => fetchPixabayVideos(theme, selectedQuery) }
    ];

    for (const fetcher of fetchers) {
        try {
            const videos = await fetcher.fn();
            if (videos && videos.length > 0) candidates = [...candidates, ...videos];
        } catch (e) { console.warn(`${fetcher.name} fetch failed in getDroneVideo.`); }
    }

    // Filter and Unique
    candidates = candidates.filter(asset => validateAsset(asset));
    candidates = Array.from(new Map(candidates.map(item => [item.id, item])).values());

    if (candidates.length > 0) {
        // Score them using the standard scoring logic (which heavily favors 4K)
        const scoredCandidates = candidates.map(c => ({ asset: c, score: calculateAssetScore(c, theme) }));

        // Sort strictly descending by score
        scoredCandidates.sort((a, b) => b.score - a.score);
        
        // Priority: 4K (Score > 1000)
        const highQuality = scoredCandidates.filter(c => c.score > 1000);
        
        // Pool selection: Use high quality if available, otherwise fallback to top of general pool
        const pool = highQuality.length >= 3 ? highQuality : scoredCandidates;

        // Randomly pick from top 10 to ensure variety
        const topSlice = pool.slice(0, 10);
        return topSlice[Math.floor(Math.random() * topSlice.length)].asset;
    }

    // Fallback if no drone video found
    return VIDEO_ASSETS[0];
};

// --- MUSIC modu: müziğe özel YouTube playlist (video+ses tek player; bkz VideoPlayer muted/volume) ---
// Katalog public/music_video_catalog.json (yt-dlp; playlist değişince yeniden üret).
let _musicCatalogCache: VideoAsset[] | null = null;

const loadMusicCatalog = async (): Promise<VideoAsset[]> => {
  if (_musicCatalogCache) return _musicCatalogCache;
  try {
    const res = await fetch('/music_video_catalog.json');
    if (!res.ok) throw new Error('music_video_catalog.json offline');
    const entries: { id: string; title?: string; duration?: number }[] = await res.json();
    if (!Array.isArray(entries)) return [];
    _musicCatalogCache = entries
      .filter(e => e?.id)
      .map(e => ({
        id: `music_yt_${e.id}`,
        url: `https://www.youtube.com/watch?v=${e.id}`,
        theme: VisualTheme.NATURE,        // tema-agnostik; MUSIC modunda tema kullanılmaz
        providerId: 'youtube_music',
        description: (e.title || 'Music').replace(/\s{2,}/g, ' ').trim(),
        quality: 'HD',
        rating: 50,
      }));
    return _musicCatalogCache;
  } catch {
    return [];
  }
};

export const getMusicVideo = async (excludeId?: string, blacklistIds: string[] = []): Promise<VideoAsset | null> => {
  const catalog = await loadMusicCatalog();
  let pool = catalog.filter(v => !blacklistIds.includes(v.id));
  if (excludeId) {
    const filtered = pool.filter(v => v.id !== excludeId);
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getStreamForTheme = async (
    theme: VisualTheme,
    excludeId?: string,
    audioMode?: AudioMode,
    blacklistIds: string[] = []
): Promise<VideoAsset> => {
  // MUSIC (INSTRUMENTAL) modu: tema-bağımsız müzik playlist'i (video+ses). Tema sağlayıcılarını bypass eder.
  if (audioMode === AudioMode.INSTRUMENTAL) {
    const musicVideo = await getMusicVideo(excludeId, blacklistIds);
    if (musicVideo) return musicVideo;
    // katalog boş/erişilemez → normal akışa düş (güvenlik)
  }

  let candidates: VideoAsset[] = [];

  // Fetch from APIs — always respect user's theme selection
  const fetchers = [
      { name: 'youtube', fn: () => fetchYouTubeVideos(theme) },
      { name: 'apple', fn: () => fetchAppleAerialsVideos(theme) },
      { name: 'pexels', fn: () => fetchPexelsVideos(theme) },
      { name: 'pixabay', fn: () => fetchPixabayVideos(theme) }
  ];

  for (const fetcher of fetchers) {
      try {
          const videos = await fetcher.fn();
          if (videos && videos.length > 0) candidates = [...candidates, ...videos];
      } catch (e) { console.warn(`${fetcher.name} fetch failed.`); }
  }

  // Fetch from Manifest
  {
    try {
        const response = await fetch('/video_manifest.json'); 
        if (response.ok) {
            const externalData = await response.json();
            const externalMatches = externalData.filter((v: any) => 
                v.theme && v.theme.toLowerCase() === theme.toLowerCase()
            ).map((v: any) => ({
                ...v,
                providerId: v.provider || 'external',
                description: v.title + (v.country ? `, ${v.country}` : ''),
                quality: v.quality || '4K' // Default manifest items to 4K if unspecified
            }));
            candidates = [...candidates, ...externalMatches];
        }
    } catch (e) { }
  }

  // Uniqueness, Blacklist & Validation
  candidates = candidates.filter(asset => validateAsset(asset) && !blacklistIds.includes(asset.id));
  if (excludeId) candidates = candidates.filter(c => c.id !== excludeId);
  candidates = Array.from(new Map(candidates.map(item => [item.id, item])).values());

  if (candidates.length > 0) {
    // 1. Score all candidates (with audioMode for surreal weighting)
    const scoredCandidates = candidates.map(c => ({ asset: c, score: calculateAssetScore(c, audioMode) }));

    // 2. Sort Descending by Score
    scoredCandidates.sort((a, b) => b.score - a.score);
    
    // 3. Smart Filtering: If top candidates are 4K (score > 1000), filter out the low score ones (HD)
    // This ensures we don't accidentally pick an HD video just because of random pool selection
    // if 4K videos are available.
    const maxScore = scoredCandidates[0].score;
    const isHighQualityAvailable = maxScore > 1000;
    
    let pool = scoredCandidates;
    if (isHighQualityAvailable) {
        // Keep only assets that are within a reasonable range of the top score (e.g. other 4K videos)
        // Discarding HD videos (which would be ~2000 points lower)
        pool = scoredCandidates.filter(item => item.score > (maxScore - 1000));
    }

    const finalCandidates = pool.map(p => p.asset);
    
    // Pick from the top 5 of the filtered pool to ensure variety but maintain quality
    const poolSize = Math.min(5, finalCandidates.length);
    return finalCandidates[Math.floor(Math.random() * poolSize)];
  }

  return VIDEO_ASSETS.filter(v => v.theme === theme && !blacklistIds.includes(v.id))[0] || VIDEO_ASSETS[0];
};
