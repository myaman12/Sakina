
import { VideoAsset, VisualTheme } from '../types';

const PIXABAY_API_KEY = "53987120-4c1c5379bdac118fc01669d83";
const BASE_URL = "https://pixabay.com/api/videos/";

const THEME_QUERIES: Record<VisualTheme, string[]> = {
    [VisualTheme.NATURE]: ["drone nature 4k", "aerial landscape 4k", "nature surreal 4k", "forest fantasy 4k", "ethereal nature 4k", "drone waterfall 4k"],
    [VisualTheme.MOUNTAIN]: ["drone mountains 4k", "aerial cliffs 4k", "mountains unreal 4k", "peaks fantasy 4k", "rainbow mountains 4k", "cappadocia 4k"],
    [VisualTheme.WATER]: ["drone ocean 4k", "aerial beach 4k", "ocean glowing 4k", "sea surreal 4k", "waterfall magic 4k", "pink lake 4k"],
    [VisualTheme.NIGHT]: ["drone night 4k", "aerial city night 4k", "night sky fantasy 4k", "stars surreal 4k", "moon ethereal 4k", "aurora unreal 4k"],
    [VisualTheme.SPACE]: ["space nebula 4k", "galaxy fantasy 4k", "cosmos unreal 4k", "planet surface 4k"],
    [VisualTheme.MICRO]: ["macro abstract 4k", "texture surreal 4k", "microscopic fantasy 4k"]
};

// In-memory cache
const cache: Record<string, VideoAsset[]> = {};

export const fetchPixabayVideos = async (theme: VisualTheme, customQuery?: string): Promise<VideoAsset[]> => {
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
        const response = await fetch(`${BASE_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query!)}&per_page=20&orientation=horizontal`);

        if (!response.ok) return [];

        const data = await response.json();
        if (!data.hits) return [];

        const assets: VideoAsset[] = data.hits
            .map((vid: any) => {
                // Priority 1: Large video, check resolution
                const videoFile = vid.videos.large;
                const is4K = videoFile && videoFile.width >= 3840;
                const isHD = videoFile && videoFile.width >= 1920;

                // Return null if not at least HD
                if (!videoFile || (!is4K && !isHD)) return null;
                
                let description = query;
                if (vid.tags) {
                    const tags = vid.tags.split(',').slice(0, 3).map((t: string) => t.trim());
                    description = tags.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
                }

                const isDrone = description?.toLowerCase().includes('drone') || description?.toLowerCase().includes('aerial');
                const isSurrealPlace = (description?.toLowerCase().includes('surreal') || 
                                       description?.toLowerCase().includes('fantasy') ||
                                       description?.toLowerCase().includes('magic') ||
                                       vid.tags?.toLowerCase().includes('surreal'));

                // Calculate a simple rating (0-100)
                const score = Math.min(100, (vid.likes / 10) + (vid.views / 5000));

                return {
                    id: `pixabay_${vid.id}`,
                    url: videoFile.url,
                    theme: theme,
                    providerId: 'pixabay',
                    description: description || 'Scenic View',
                    isSurreal: isSurrealPlace || isDrone,
                    quality: is4K ? '4K' : 'HD',
                    rating: score
                };
            })
            .filter((asset: any): asset is VideoAsset => asset !== null);

        cache[cacheKey] = assets;
        return assets;

    } catch (error) {
        console.error("Failed to fetch Pixabay videos:", error);
        return [];
    }
};
