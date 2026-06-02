
import { VideoAsset, VisualTheme } from '../types';

// SECURITY NOTE:
// In a pure client-side application (like this React app), secrets stored in code
// or environment variables are technically visible to users via the browser's Network Inspector.
const PEXELS_API_KEY = "xwt76mxtWotLb5ZTNJD767o8iZwu9Mjbd7PrjngMrLzbWobrNxi70zcq";
const BASE_URL = "https://api.pexels.com/videos/search";

// Maps App Themes to Pexels Search Queries with a focus on "Surreal Wonders" and "Drone Footage"
const THEME_QUERIES: Record<VisualTheme, string[]> = {
    [VisualTheme.NATURE]: [
        "drone nature 4k", "aerial forest 4k", "cinematic drone landscape 4k",
        "volcano eruption aerial 4k", "magical forest 4k", "ethereal nature 4k", 
        "fairytale forest 4k", "unreal nature aerial 4k", "socotra island 4k",
        "mystical forest fog 4k", "lava flow 4k", "fpv drone forest 4k"
    ],
    [VisualTheme.MOUNTAIN]: [
        "drone mountains 4k", "aerial alps 4k", "cinematic mountain drone 4k",
        "volcano crater 4k", "rainbow mountains china 4k", "cappadocia aerial 4k", 
        "iceland mountains 4k", "otherworldly mountains 4k", "highlands aerial 4k",
        "zhangye danxia 4k", "fpv mountain dive 4k"
    ],
    [VisualTheme.WATER]: [
        "drone ocean 4k", "aerial waves 4k", "cinematic coast drone 4k",
        "underwater 4k ocean", "massive waves 4k", "pink lake aerial 4k", 
        "bioluminescent water 4k", "surreal ocean waves 4k", "frozen bubbles lake 4k", 
        "salar de uyuni 4k", "deep sea creatures 4k", "drone waterfall 4k"
    ],
    [VisualTheme.NIGHT]: [
        "drone night city 4k", "aerial night view 4k",
        "surreal night sky 4k", "glowing plants night 4k", "unreal aurora 4k",
        "milky way time-lapse 4k", "nebula sky night 4k", "luminous night 4k",
        "lightning storm night 4k", "northern lights drone 4k"
    ],
    [VisualTheme.SPACE]: [
        "nebula 4k", "galaxy cosmic 4k", "interstellar space 4k", 
        "unreal planet surface 4k", "celestial wonders 4k", "supernova 4k",
        "space station view 4k", "earth from space 4k"
    ],
    [VisualTheme.MICRO]: [
        "macro surreal 4k", "abstract texture 4k", "microscopic wonders 4k",
        "unreal macro plant 4k", "crystalline structure 4k", "fluid dynamics 4k"
    ]
};

// In-memory cache to prevent spamming the API
const cache: Record<string, VideoAsset[]> = {};

export const fetchPexelsVideos = async (theme: VisualTheme, customQuery?: string): Promise<VideoAsset[]> => {
    let query = customQuery;
    
    if (!query) {
        const queries = THEME_QUERIES[theme];
        query = queries[Math.floor(Math.random() * queries.length)];
    }
    
    const cacheKey = `${theme}-${query}`;
    if (cache[cacheKey] && cache[cacheKey].length > 0) {
        return cache[cacheKey];
    }

    try {
        const response = await fetch(`${BASE_URL}?query=${encodeURIComponent(query!)}&per_page=15&orientation=landscape`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });

        if (!response.ok) return [];

        const data = await response.json();
        if (!data.videos) return [];

        const assets: VideoAsset[] = data.videos
            .map((vid: any) => {
                // Priority 1: Look for explicit 4K (UHD)
                let bestFile = vid.video_files.find((f: any) => f.width >= 3840);
                let qualityLabel = '4K';

                // Priority 2: Fallback to High Quality HD if 4K unavailable
                if (!bestFile) {
                    bestFile = vid.video_files.find((f: any) => f.width >= 1920);
                    qualityLabel = 'HD';
                }
                
                if (!bestFile) return null;

                let displayTitle = query;
                if (vid.url) {
                    try {
                        const parts = vid.url.split('/').filter((p: string) => p.length > 0);
                        const slugPart = parts[parts.length - 1]; 
                        const cleanSlug = slugPart.replace(/-\d+$/, '');
                        if (cleanSlug.length > 2) {
                            displayTitle = cleanSlug.split('-').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ');
                        }
                    } catch (e) {}
                }

                // Check for Surreal/Drone Topics
                const lowerTitle = displayTitle?.toLowerCase() || "";
                const isDrone = lowerTitle.includes('drone') || lowerTitle.includes('aerial') || lowerTitle.includes('fpv');
                const isSurrealPlace = (lowerTitle.includes('surreal') || 
                                       lowerTitle.includes('magical') ||
                                       lowerTitle.includes('unreal') ||
                                       lowerTitle.includes('volcano') ||
                                       lowerTitle.includes('lava') ||
                                       lowerTitle.includes('underwater') ||
                                       lowerTitle.includes('wave') ||
                                       lowerTitle.includes('otherworldly') ||
                                       vid.url?.toLowerCase().includes('surreal'));

                return {
                    id: `pexels_${vid.id}`,
                    url: bestFile.link, 
                    theme: theme,
                    providerId: 'pexels',
                    description: displayTitle || 'Scenic View',
                    isSurreal: isSurrealPlace || isDrone,
                    quality: qualityLabel,
                    rating: (isSurrealPlace || isDrone) ? 95 : 70
                };
            })
            .filter((asset: any): asset is VideoAsset => asset !== null);

        cache[cacheKey] = assets;
        return assets;

    } catch (error) {
        console.error("Failed to fetch Pexels videos:", error);
        return [];
    }
};
