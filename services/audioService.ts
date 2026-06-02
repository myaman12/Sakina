
import { AudioAsset, AudioMode } from '../types';

const RIZA_ITEM_ID = "HafzRizaGunay";
const RIZA_METADATA_URL = `https://archive.org/metadata/${RIZA_ITEM_ID}`;
const HARAMAIN_ITEM_ID = "HaramainMuadhins";
const HARAMAIN_METADATA_URL = `https://archive.org/metadata/${HARAMAIN_ITEM_ID}`;

// Updated to the user-provided stable collection
const KASIMI_ITEM_ID = "ebulkasimi"; 
const KASIMI_METADATA_URL = `https://archive.org/metadata/${KASIMI_ITEM_ID}`;

// Multi-Repo Support for Qassas
const QASSAS_ITEM_IDS = [
    "Adhan_Madinah_Qassas",
    "3rdramadan1440madeenahmaghribadhaansheikhmuhammadmarwanqassaas"
];

// Keywords to identify Quran recitations in filenames (Strict Filter)
const QURAN_KEYWORDS = [
    "sure", "surah", "ayet", "ayat", "cuz", "juz", "kuran", "quran", "bakara", "fatiha", "yasin",
    "tebareke", "amme", "fetih", "vakia", "rahman", "ihlas", "felak", "nas", "tilavet", "tilaveti",
    "quran-i", "amenerrasulu", "huvallahullezi", "lev enzelna", "ayetel kursi", "ashr", "hasr", "hashr",
    "duha", "insirah", "kadir", "beyyine", "zilzal", "adiyat", "karia", "tekasur", "asr", "humeze",
    "fil", "kureys", "maun", "kevser", "kafirun", "nasr", "tebbet", "suresi",
    "kerim", "tilawat", "tilawet", "recitation", "mushaf", "koran", "al-quran", "alkuran",
    "baqarah", "imran", "nisa", "maidah", "anam", "araf", "anfal", "tawbah", "tawba",
    "mulk", "muzzammil", "muddathir", "qiyamah", "naba", "naziat", "abasa", "takwir",
    "infitar", "mutaffifin", "inshiqaq", "buruj", "tariq", "ala", "ghashiyah", "fajr",
    "balad", "shams", "lail", "qadr", "bayyina", "zalzalah", "adiyat", "qariah",
    "takathur", "humazah", "kawthar", "masad", "ikhlas"
];

const RIZA_KNOWN_DUAS = [
    "Sekine_Duasi.mp3", "Cevsen_Ul_Kebir.mp3", "Veysel_Karani_Munacati.mp3",
    "Evrad_I_Kudsiye.mp3", "Tahmidiye.mp3", "Hulasa_Tul_Hulasa.mp3",
    "Dua_I_Ism_I_Azam.mp3", "Celcelutiye.mp3"
];

const RIZA_KNOWN_QURAN = [
    "Munacat_Ul_Kuran.mp3", "Hafiz_Riza_Gunay_Kuran_i_Kerim_Tilaveti.mp3"
];

const ADHAN_KNOWN_FILES = [
    "Madinah-Adhan-1.mp3", "Makkah-Adhan-1.mp3", "Haramain-Maghrib.mp3", "Fajr-Adhan-Madinah.mp3"
];

// Exact filenames matching the ebulkasimi archive
const KASIMI_KNOWN_FILES = [
    "AMENERRASULU+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "ALA+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "KIYAMET+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "NEBE+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "NAZIAT+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "ABESE+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a",
    "TEKVIR+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a"
];

const QASSAS_KNOWN_FILES = [
    "Adhan_Madinah_Qassas.mp3"
];

const FALLBACK_ADHAN_URL = "https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/azan/sheikh-muhammad-qassas-madinah-107.mp3";

const createAssetFromFilename = (filename: string, identifier: string, artist: string, type: AudioMode, idPrefix: string): AudioAsset => {
    const encodedName = encodeURIComponent(filename).replace(/%2F/g, '/');
    const url = `https://archive.org/download/${identifier}/${encodedName}`;
    let title = filename
        .replace(/\.(mp3|m4a|mp4)$/i, '')
        .replace(/\+/g, ' ')
        .replace(/-AHMED EBUL KASIMI/gi, '')
        .replace(/\(256kbit\)/gi, '')
        .replace(/[_-]/g, ' ')
        .trim();
        
    if (identifier === RIZA_ITEM_ID) title = title.replace(/Hafiz Riza Gunay/gi, '').trim();
    if (identifier.includes("Qassas") || identifier.includes("3rdramadan")) title = "Adhan (Madinah HQ)";

    return { id: `${idPrefix}_static_${filename.replace(/\W/g, '')}`, url, type, title: title || "Recitation", artist };
};

export const generateRizaContent = (): AudioAsset[] => {
    const duas = RIZA_KNOWN_DUAS.map(f => createAssetFromFilename(f, RIZA_ITEM_ID, 'Rıza Günay', AudioMode.DUA, 'riza_dua'));
    const quran = RIZA_KNOWN_QURAN.map(f => createAssetFromFilename(f, RIZA_ITEM_ID, 'Rıza Günay', AudioMode.QURAN, 'riza_quran'));
    return [...duas, ...quran];
};

export const generateKasimiContent = (): AudioAsset[] => {
    return KASIMI_KNOWN_FILES.map(f => createAssetFromFilename(f, KASIMI_ITEM_ID, 'Ahmed Ebül Kasımi', AudioMode.QURAN, 'kasimi_quran'));
};

export const generateQassasContent = (): AudioAsset[] => {
    return QASSAS_KNOWN_FILES.map(f => createAssetFromFilename(f, QASSAS_ITEM_IDS[0], 'Sheikh Muhammad Marwan Qassas', AudioMode.ADHAN, 'qassas_adhan'));
};

const processArchiveFiles = (identifier: string, files: any[], defaultArtist: string, overrideType: AudioMode | null, idPrefix: string): AudioAsset[] => {
    // Include mp3, m4a, and mp4 (sometimes audio is uploaded as video container on Archive.org)
    const validFiles = files.filter((file: any) => {
        const name = file.name.toLowerCase();
        return file.format?.includes("MP3") || name.endsWith(".mp3") || name.endsWith(".m4a") || name.endsWith(".mp4");
    });
    
    return validFiles.map((file: any) => {
        const nameLower = file.name.toLowerCase();
        const encodedName = encodeURIComponent(file.name).replace(/%2F/g, '/');
        const url = `https://archive.org/download/${identifier}/${encodedName}`;
        
        let type = overrideType || AudioMode.QURAN;
        
        if (identifier === RIZA_ITEM_ID) {
            const isQuranFile = QURAN_KEYWORDS.some(kw => nameLower.includes(kw));
            type = isQuranFile ? AudioMode.QURAN : AudioMode.DUA;
        }

        let rawTitle = (file.title || file.name)
            .replace(/\.(mp3|m4a|mp4)$/i, '')
            .replace(/\+/g, ' ')
            .replace(/^\d+[-_\s.]+/g, '')
            .replace(/[_-]/g, ' ')
            .replace(/-AHMED EBUL KASIMI/gi, '')
            .replace(/\(256kbit\)/gi, '');
            
        let title = rawTitle.trim();
        
        if (identifier === RIZA_ITEM_ID || identifier === KASIMI_ITEM_ID) {
             title = title.replace(/Hafiz Riza Gunay/gi, '').replace(/Ahmed Ebul Kasimi/gi, '').trim() || "Recitation";
        } else if (type === AudioMode.ADHAN) {
            if (identifier.includes("Qassas") || identifier.includes("3rdramadan")) {
                if (title.includes("3rd Ramadan")) title = "Adhan (Ramadan 1440)";
                else title = "Adhan Madinah (HQ)";
            } else {
                if (rawTitle.toLowerCase().includes('makkah')) title = "Adhan (Makkah)";
                else if (rawTitle.toLowerCase().includes('madinah')) title = "Adhan (Madinah)";
                else title = "Adhan (Haramain)";
            }
        }
        
        return { id: `${idPrefix}_${file.name.replace(/\W/g, '')}`, url, type, title, artist: defaultArtist };
    });
};

export const generateKurdiContent = (): AudioAsset[] => {
    return Array.from({ length: 114 }, (_, i) => ({
        id: `quran_kurdi_${(i + 1).toString().padStart(3, '0')}`,
        url: `https://server6.mp3quran.net/kurdi/${(i + 1).toString().padStart(3, '0')}.mp3`,
        type: AudioMode.QURAN, title: `Surah ${i + 1}`, artist: 'Muhammed Al-Kurdi'
    }));
};

export const generateMahirContent = (): AudioAsset[] => {
    return Array.from({ length: 114 }, (_, i) => ({
        id: `quran_mahir_${(i + 1).toString().padStart(3, '0')}`,
        url: `https://server12.mp3quran.net/maher/${(i + 1).toString().padStart(3, '0')}.mp3`,
        type: AudioMode.QURAN, title: `Surah ${i + 1}`, artist: 'Mahir Al-Muaiqly'
    }));
};

export const fetchRizaGunayContent = async (): Promise<AudioAsset[]> => {
  const staticRiza = generateRizaContent();
  try {
    const response = await fetch(RIZA_METADATA_URL);
    if (!response.ok) throw new Error("Metadata API offline");
    const data = await response.json();
    if (!data?.files) return staticRiza;
    
    const fetched = processArchiveFiles(RIZA_ITEM_ID, data.files, 'Rıza Günay', null, 'riza');
    const combined = [...staticRiza, ...fetched];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  } catch (error) {
    return staticRiza;
  }
};

export const fetchKasimiContent = async (): Promise<AudioAsset[]> => {
  const staticKasimi = generateKasimiContent();
  try {
    const response = await fetch(KASIMI_METADATA_URL);
    if (!response.ok) throw new Error("Metadata API offline");
    const data = await response.json();
    if (!data?.files) return staticKasimi;
    
    const fetched = processArchiveFiles(KASIMI_ITEM_ID, data.files, 'Ahmed Ebül Kasımi', AudioMode.QURAN, 'kasimi_quran');
    const combined = [...staticKasimi, ...fetched];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  } catch (error) {
    return staticKasimi;
  }
};

export const fetchQassasContent = async (): Promise<AudioAsset[]> => {
    const staticQassas = generateQassasContent();
    try {
        const promises = QASSAS_ITEM_IDS.map(id => 
            fetch(`https://archive.org/metadata/${id}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        );
        
        const results = await Promise.all(promises);
        let fetchedAssets: AudioAsset[] = [];
        
        results.forEach((data, index) => {
             if (data?.files) {
                 const id = QASSAS_ITEM_IDS[index];
                 // Dynamic prefix to prevent ID collisions
                 fetchedAssets = [...fetchedAssets, ...processArchiveFiles(id, data.files, 'Sheikh Muhammad Marwan Qassas', AudioMode.ADHAN, `qassas_dyn_${index}`)];
             }
        });
        
        if (fetchedAssets.length === 0) return staticQassas;

        const combined = [...staticQassas, ...fetchedAssets];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
    } catch (error) {
        return staticQassas;
    }
};

export const fetchAdhanContent = async (): Promise<AudioAsset[]> => {
  const staticAdhans = ADHAN_KNOWN_FILES.map(f => createAssetFromFilename(f, HARAMAIN_ITEM_ID, 'Haramain Muadhins', AudioMode.ADHAN, 'adhan'));
  try {
    const response = await fetch(HARAMAIN_METADATA_URL);
    if (!response.ok) throw new Error("Metadata API offline");
    const data = await response.json();
    if (data?.files) {
        const fetched = processArchiveFiles(HARAMAIN_ITEM_ID, data.files, 'Haramain Muadhins', AudioMode.ADHAN, 'adhan');
        const combined = [...staticAdhans, ...fetched];
        return Array.from(new Map(combined.map(item => [item.id, item])).values()).sort(() => Math.random() - 0.5);
    }
    return staticAdhans;
  } catch (error) {
    return staticAdhans.length > 0 ? staticAdhans : [{
        id: 'adhan_fallback_static', url: FALLBACK_ADHAN_URL, type: AudioMode.ADHAN,
        title: 'Adhan (Madinah)', artist: 'Sheikh Muhammad Marwan Qassas'
    }];
  }
};
