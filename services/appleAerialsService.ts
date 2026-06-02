
import { VideoAsset, VisualTheme } from '../types';

const APPLE_MANIFEST_URL = "https://sylvan.apple.com/Aerials/2x/entries.json";

const CATEGORY_MAP: Record<string, VisualTheme> = {
    "sea": VisualTheme.WATER, "beach": VisualTheme.WATER, "water": VisualTheme.WATER,
    "nature": VisualTheme.NATURE, "mountain": VisualTheme.MOUNTAIN, "forest": VisualTheme.NATURE,
    "space": VisualTheme.SPACE, "night": VisualTheme.NIGHT, "volcano": VisualTheme.MOUNTAIN
};

let cachedAssets: VideoAsset[] = [];

export const fetchAppleAerialsVideos = async (theme: VisualTheme): Promise<VideoAsset[]> => {
    try {
        if (cachedAssets.length === 0) {
            const response = await fetch(APPLE_MANIFEST_URL);
            const data = await response.json();
            const allAssets: VideoAsset[] = [];
            const topLevelItems = Array.isArray(data) ? data : (data.assets || []); 
            
            topLevelItems.forEach((item: any) => {
                const assets = item.assets || [item];
                assets.forEach((asset: any) => {
                    const label = (asset.accessibilityLabel || asset.title || "").toLowerCase();
                    let detectedTheme: VisualTheme | null = null;
                    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
                        if (label.includes(key)) { detectedTheme = val; break; }
                    }
                    if (detectedTheme) {
                        // Strict Priority: 4K SDR (Most Compatible High Res) -> 4K HEVC -> 1080p
                        const videoUrl = asset["url-4K-SDR"] || asset["url-4K-HEVC"] || asset["url-1080-SDR"];
                        
                        if (videoUrl) {
                            const is4K = videoUrl.includes("4K") || (asset["url-4K-SDR"] || asset["url-4K-HEVC"]);
                            
                            allAssets.push({
                                id: `apple_${asset.id || Math.random().toString(36).substr(2, 9)}`,
                                url: videoUrl,
                                theme: detectedTheme,
                                providerId: 'apple_aerials',
                                description: asset.accessibilityLabel || asset.title || "Scenic Wonder",
                                isSurreal: label.includes('volcano') || label.includes('clouds') || detectedTheme === VisualTheme.SPACE,
                                quality: is4K ? '4K' : 'HD',
                                rating: 90
                            });
                        }
                    }
                });
            });
            cachedAssets = Array.from(new Map(allAssets.map(item => [item.url, item])).values());
        }
        return cachedAssets.filter(a => a.theme === theme);
    } catch (error) {
        return [];
    }
};
