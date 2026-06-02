
export interface Quote {
  text_ar?: string;
  text_en: string; // Used for the main display text (localized)
  source: string;
  type: 'quran' | 'hadith' | 'quote' | 'dua' | 'scholar' | 'adhan';
}

export enum AudioMode {
  QURAN = 'quran',
  INSTRUMENTAL = 'instrumental',
  DUA = 'dua',
  ADHAN = 'adhan'
}

export enum VisualTheme {
  NATURE = 'nature',
  MOUNTAIN = 'mountain',
  WATER = 'water',
  NIGHT = 'night',
  SPACE = 'space',
  MICRO = 'micro'
}

export type AppLanguage = 'en' | 'nl' | 'tr';

export interface AppSettings {
  audioMode: AudioMode;
  volume: number;
  showQuotes: boolean;
  quoteFrequency: 'low' | 'medium' | 'high';
  aiCurationLevel: 'standard' | 'dynamic';
  videoInterval: number; // milliseconds
  audioInterval: number; // milliseconds
  language: AppLanguage;
}

// --- New Provider Architecture ---

export type StreamType = 'MP4' | 'HLS' | 'DASH';

export interface StreamSourceProvider {
  providerId: string;
  displayName: string;
  streamType: StreamType;
  manifestUrl?: string;
  apiEndpoint?: string;
  attribution: string;
  licenseNotes?: string;
  cachePolicy?: 'none' | 'optional' | 'required';
}

export interface VideoAsset {
  id: string;
  url: string; // The stream URL
  theme: VisualTheme;
  providerId: string; // Links to StreamSourceProvider
  description: string;
  isSurreal?: boolean;
  quality?: string; // e.g., '4K', 'HD'
  rating?: number; // 0-100 score for prioritization
}

export interface AudioAsset {
  id: string;
  url: string;
  type: AudioMode;
  title: string;
  artist: string;
}
