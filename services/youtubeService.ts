
import { VideoAsset, VisualTheme } from '../types';

let cachedCatalog: VideoAsset[] | null = null;

export const fetchYouTubeVideos = async (theme: VisualTheme): Promise<VideoAsset[]> => {
    try {
        if (!cachedCatalog) {
            const response = await fetch('/youtube_catalog.json');
            if (!response.ok) return [];
            const data: VideoAsset[] = await response.json();
            cachedCatalog = data.map(v => ({
                ...v,
                theme: v.theme.toLowerCase() as VisualTheme,
                providerId: 'youtube'
            }));
        }
        return cachedCatalog.filter(v => v.theme === theme);
    } catch (error) {
        console.warn('Failed to load YouTube catalog:', error);
        return [];
    }
};
