
import { Quote, VisualTheme, AudioAsset, AudioMode, VideoAsset, AppLanguage } from '../types';
import { generateCuratedContent } from './geminiService';
import { FALLBACK_QUOTES_DATA, DUA_QUOTES_DATA, SCHOLAR_QUOTES_DATA, ADHAN_QUOTES_DATA, SAFE_QURAN_FALLBACKS } from '../constants';

// --- API Endpoints ---
const QURAN_API_BASE = "https://api.alquran.cloud/v1/ayah";
const HADITH_API_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/1.json";
const GENERIC_QUOTE_API = "https://dummyjson.com/quotes/random";

const QURAN_EDITIONS: Record<string, string> = {
  'en': 'en.sahih',
  'nl': 'nl.keyzer',
  'tr': 'tr.diyanet'
};

// --- Constants ---
const MAX_WORD_COUNT = 20;

const isValidQuote = (text: string) => {
    if (!text) return false;
    return text.trim().split(/\s+/).length <= MAX_WORD_COUNT;
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const localize = (data: any, lang: AppLanguage): Quote => {
    return {
        text_ar: data.text_ar,
        text_en: data.text[lang] || data.text['en'],
        source: data.source,
        type: data.type
    };
};

const SPECIFIC_CLIP_MAPPING: Record<string, string[]> = {
    'amenerrasulu': ['2:285', '2:286'],
    'ayetel kursi': ['2:255'],
    'ayet-el kursi': ['2:255'],
    'lev enzelna': ['59:21', '59:22', '59:23', '59:24'],
    'hashr': ['59:18', '59:21', '59:22', '59:23', '59:24'],
    'hasr': ['59:18', '59:21', '59:22', '59:23', '59:24'],
    'huvallahullezi': ['59:22', '59:23', '59:24'],
    'duha': ['93:1', '93:2', '93:3', '93:4'], 
    'insirah': ['94:1', '94:2', '94:3', '94:4', '94:5', '94:6'],
    'sharh': ['94:1', '94:2', '94:3', '94:4', '94:5', '94:6'],
    'asr': ['103:1', '103:2', '103:3'],
    'ikhlas': ['112:1', '112:2', '112:3', '112:4'],
    'falaq': ['113:1', '113:2', '113:3', '113:4', '113:5'],
    'nas': ['114:1', '114:2', '114:3', '114:4', '114:5', '114:6'],
    'fatiha': ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'],
    'mulk': ['67:1', '67:2', '67:3', '67:4'], 
    'nebe': ['78:1', '78:2', '78:3', '78:4'],
    'amme': ['78:1', '78:2', '78:3', '78:4']
};

const AUDIO_SURAH_MAP: Record<string, number> = {
  'quran_fatiha': 1, 'quran_baqarah': 2, 'quran_imran': 3, 'quran_nisa': 4,
  'quran_maidah': 5, 'quran_anam': 6, 'quran_araf': 7, 'quran_anfal': 8,
  'quran_tawbah': 9, 'quran_yunus': 10, 'quran_hud': 11, 'quran_yusuf': 12,
  'quran_rad': 13, 'quran_ibrahim': 14, 'quran_hijr': 15, 'quran_nahl': 16,
  'quran_isra': 17, 'quran_kahf': 18, 'quran_maryam': 19, 'quran_taha': 20,
  'quran_anbiya': 21, 'quran_hajj': 22, 'quran_muminoon': 23, 'quran_nur': 24,
  'quran_furqan': 25, 'quran_shuara': 26, 'quran_naml': 27, 'quran_qasas': 28,
  'quran_ankabut': 29, 'quran_rum': 30, 'quran_luqman': 31, 'quran_sajdah': 32,
  'quran_ahzab': 33, 'quran_saba': 34, 'quran_fatir': 35, 'quran_yasin': 36,
  'quran_saffat': 37, 'quran_sad': 38, 'quran_zumar': 39, 'quran_ghafir': 40,
  'quran_fussilat': 41, 'quran_shura': 42, 'quran_zukhruf': 43, 'quran_dukhan': 44,
  'quran_jathiyah': 45, 'quran_ahqaf': 46, 'quran_muhammad': 47, 'quran_fath': 48,
  'quran_hujurat': 49, 'quran_qaf': 50, 'quran_dhariyat': 51, 'quran_tur': 52,
  'quran_najm': 53, 'quran_qamar': 54, 'quran_rahman': 55, 'quran_waqiah': 56,
  'quran_hadid': 57, 'quran_mujadila': 58, 'quran_hashr': 59, 'quran_mumtahanah': 60,
  'quran_saff': 61, 'quran_jumuah': 62, 'quran_munafiqun': 63, 'quran_taghabun': 64,
  'quran_talaq': 65, 'quran_tahrim': 66, 'quran_mulk': 67, 'quran_qalam': 68,
  'quran_haqqah': 69, 'quran_maarij': 70, 'quran_nuh': 71, 'quran_jinn': 72,
  'quran_muzzammil': 73, 'quran_muddathir': 74, 'quran_qiyamah': 75, 'quran_insan': 76,
  'quran_mursalat': 77, 'quran_naba': 78, 'quran_naziat': 79, 'quran_abasa': 80,
  'quran_takwir': 81, 'quran_infitar': 82, 'quran_mutaffifin': 83, 'quran_inshiqaq': 84,
  'quran_buruj': 85, 'quran_tariq': 86, 'quran_ala': 87, 'quran_ghashiyah': 88,
  'quran_fajr': 89, 'quran_balad': 90, 'quran_shams': 91, 'quran_lail': 92,
  'quran_duha': 93, 'quran_sharh': 94, 'quran_tin': 95, 'quran_alaq': 96,
  'quran_qadr': 97, 'quran_bayyina': 98, 'quran_zalzalah': 99, 'quran_adiyat': 100,
  'quran_qariah': 101, 'quran_takathur': 102, 'quran_asr': 103, 'quran_humazah': 104,
  'quran_fil': 105, 'quran_quraysh': 106, 'quran_maun': 107, 'quran_kawthar': 108,
  'quran_kafirun': 109, 'quran_nasr': 110, 'quran_masad': 111, 'quran_ikhlas': 112,
  'quran_falaq': 113, 'quran_nas': 114
};

const SURAH_KEYWORDS: Record<string, number> = {
    "fatiha": 1, "baqarah": 2, "bakara": 2, "amenerrasulu": 2, "ayetel kursi": 2,
    "yasin": 36, "hashr": 59, "hasr": 59, "mulk": 67, "nebe": 78, "amme": 78,
    "duha": 93, "insirah": 94, "asr": 103, "ikhlas": 112, "nas": 114
};

const getSurahNumberFromAudio = (audio: AudioAsset): number | null => {
    if (AUDIO_SURAH_MAP[audio.id]) return AUDIO_SURAH_MAP[audio.id];
    const searchStr = normalizeText(audio.title + " " + audio.id);
    const sortedKeys = Object.keys(SURAH_KEYWORDS).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        try {
            const regex = new RegExp(`\\b${normalizeText(key)}\\b`, 'i');
            if (regex.test(searchStr)) return SURAH_KEYWORDS[key];
        } catch (e) {
             if (searchStr.split(' ').includes(normalizeText(key))) return SURAH_KEYWORDS[key];
        }
    }
    const idMatch = audio.id.match(/(?:kurdi|mahir|quran)_(\d+)(?:$|_)/);
    if (idMatch && idMatch[1]) return parseInt(idMatch[1]);
    const titleMatch = audio.title.match(/Surah\s+(\d+)/i);
    if (titleMatch && titleMatch[1]) return parseInt(titleMatch[1]);
    return null;
};

const SURAH_AYAH_COUNTS: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

const VIDEO_KEYWORD_QUOTES: Record<string, string[]> = {
  'mountain': ['16:15', '78:7'], 'sea': ['16:14', '55:19'], 'night': ['25:47', '78:10']
};

export const fetchGenericQuote = async (): Promise<Quote | null> => {
  try {
    const res = await fetch(GENERIC_QUOTE_API);
    const data = await res.json();
    if (data?.quote && isValidQuote(data.quote)) {
      return { text_en: data.quote, source: data.author || 'Anonymous', type: 'quote' };
    }
  } catch (e) {}
  return null;
};

export const fetchQuranVerse = async (ref: string = "94:5", language: AppLanguage = 'en'): Promise<Quote | null> => {
  try {
    const edition = QURAN_EDITIONS[language] || 'en.sahih';
    const res = await fetch(`${QURAN_API_BASE}/${ref}/editions/ar.alafasy,${edition}`);
    const data = await res.json();
    if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
      const arEntry = data.data.find((e: any) => e.edition.identifier === 'ar.alafasy');
      const locEntry = data.data.find((e: any) => e.edition.identifier === edition);
      if (arEntry && locEntry) {
        return { text_ar: arEntry.text, text_en: locEntry.text, source: `Surah ${locEntry.surah.englishName} ${locEntry.surah.number}:${locEntry.numberInSurah}`, type: 'quran' };
      }
    }
  } catch (e) {}
  return null;
};

export const getContent = async (
  curationLevel: 'standard' | 'dynamic',
  timeOfDay: string,
  theme: VisualTheme,
  language: AppLanguage,
  currentAudio?: AudioAsset,
  currentVideo?: VideoAsset,
  excludeSource?: string
): Promise<{ quote: Quote, suggestedTheme?: VisualTheme }> => {

  const isQuranMode = currentAudio?.type === AudioMode.QURAN;
  const isAdhanMode = currentAudio?.type === AudioMode.ADHAN;

  // 1. Dynamic AI with Strict Categorical Integrity
  if (curationLevel === 'dynamic') {
    const mode = currentAudio?.type || 'general';
    const aiResult = await generateCuratedContent(timeOfDay, theme, language, currentVideo?.description, excludeSource, mode);
    
    if (aiResult && aiResult.quote) {
        // Double check AI context: If AI returned a secular quote in Quran mode, reject it.
        if (isQuranMode && aiResult.quote.type !== 'quran') {
            console.warn("AI returned non-quran quote in Quran mode. Invoking safety net.");
        } else {
            return { quote: aiResult.quote, suggestedTheme: aiResult.recommendedTheme as VisualTheme };
        }
    }
  }

  // 2. Specialized Fallbacks (Non-AI)
  // ADHAN MODE: Only show Adhan quotes
  if (isAdhanMode) {
      const localizedAdhan = ADHAN_QUOTES_DATA.map(a => localize(a, language));
      return { quote: localizedAdhan[Math.floor(Math.random() * localizedAdhan.length)] };
  }

  // QURAN MODE: Only show Quran verses
  if (isQuranMode) {
    const audioSearchStr = normalizeText(currentAudio.title + " " + currentAudio.id);
    const sortedSpecificKeys = Object.keys(SPECIFIC_CLIP_MAPPING).sort((a, b) => b.length - a.length);
    for (const key of sortedSpecificKeys) {
        if (new RegExp(`\\b${normalizeText(key)}\\b`, 'i').test(audioSearchStr)) {
            const refs = SPECIFIC_CLIP_MAPPING[key];
            const quranQuote = await fetchQuranVerse(refs[Math.floor(Math.random() * refs.length)], language);
            if (quranQuote) return { quote: quranQuote };
        }
    }
    const surahNum = getSurahNumberFromAudio(currentAudio);
    if (surahNum) {
      const quranQuote = await fetchQuranVerse(`${surahNum}:${getRandomInt(1, SURAH_AYAH_COUNTS[surahNum] || 5)}`, language);
      if (quranQuote) return { quote: quranQuote };
    }
    // Hard Safety Net: NEVER allow secular fallback in Quran mode
    return { quote: localize(SAFE_QURAN_FALLBACKS[Math.floor(Math.random() * SAFE_QURAN_FALLBACKS.length)], language) };
  }

  // DUA MODE: Only show Dua quotes, filtered by specific dua if possible
  if (currentAudio?.type === AudioMode.DUA) {
      const audioTitle = normalizeText(currentAudio.title);
      let filteredDua = DUA_QUOTES_DATA;

      // Match specific dua quotes to the audio playing
      if (audioTitle.includes('cevsen') || audioTitle.includes('cevsen')) {
          // Filter for Cevşen-ül Kebir quotes
          filteredDua = DUA_QUOTES_DATA.filter(d => d.source.toLowerCase().includes('cevşen') || d.source.toLowerCase().includes('cevsen'));
      } else if (audioTitle.includes('sekine')) {
          // Filter for Sekine quotes
          filteredDua = DUA_QUOTES_DATA.filter(d => d.source.toLowerCase().includes('sekine'));
      }

      // Fallback to all dua quotes if no specific match found
      if (filteredDua.length === 0) {
          filteredDua = DUA_QUOTES_DATA;
      }

      const localizedDua = filteredDua.map(d => localize(d, language));
      return { quote: localizedDua[Math.floor(Math.random() * localizedDua.length)] };
  }

  // 3. Instrumental/General Fallbacks
  if (currentAudio?.type === AudioMode.INSTRUMENTAL) {
      const generic = await fetchGenericQuote();
      if (generic) return { quote: generic };
      // If generic quote fetch fails, use scholar quotes as fallback
      const localizedScholar = SCHOLAR_QUOTES_DATA.map(s => localize(s, language));
      return { quote: localizedScholar[Math.floor(Math.random() * localizedScholar.length)] };
  }

  // 4. Ultimate Fallback (should rarely be reached)
  const localizedFallbacks = FALLBACK_QUOTES_DATA.map(q => localize(q, language));
  return { quote: localizedFallbacks[0] };
};
