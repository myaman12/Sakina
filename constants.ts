
import { VideoAsset, AudioAsset, VisualTheme, AudioMode, Quote, StreamSourceProvider } from './types';

// --- Stream Source Providers Configuration ---
export const STREAM_PROVIDERS: Record<string, StreamSourceProvider> = {
  apple_aerials: {
    providerId: 'apple_aerials',
    displayName: 'Apple',
    streamType: 'MP4',
    attribution: 'Aerials by Apple Inc.',
    cachePolicy: 'optional'
  },
  robin_aerials: {
    providerId: 'robin_aerials',
    displayName: 'Robin',
    streamType: 'MP4',
    attribution: 'Robin Fourcade',
    cachePolicy: 'optional'
  },
  pexels: {
    providerId: 'pexels',
    displayName: 'Pexels',
    streamType: 'MP4',
    attribution: 'Video via Pexels API',
    cachePolicy: 'none'
  },
  pixabay: {
    providerId: 'pixabay',
    displayName: 'Pixabay',
    streamType: 'MP4',
    attribution: 'Video via Pixabay API',
    cachePolicy: 'none'
  },
  youtube: {
    providerId: 'youtube',
    displayName: 'YouTube',
    streamType: 'MP4',
    attribution: 'Various Creators via YouTube',
    cachePolicy: 'required'
  }
};

// --- Video Manifest ---
export const VIDEO_ASSETS: VideoAsset[] = [
  {
    id: 'robin_nature_alps',
    theme: VisualTheme.MOUNTAIN,
    url: 'https://github.com/RobinFrcd/AerialShots/releases/download/french-alps-2022-v1/robinfrcd_french_alps_mont_blanc_2_1080p_h264.m4v',
    providerId: 'robin_aerials',
    description: 'French Alps, France'
  },
  {
    id: 'robin_water_reine',
    theme: VisualTheme.WATER,
    url: 'https://github.com/RobinFrcd/AerialShots/releases/download/norway-2021-v1/robinfrcd_reine_1080p_H264.m4v',
    providerId: 'robin_aerials',
    description: 'Reine, Norway'
  },
  {
    id: 'robin_night_henningsvaer',
    theme: VisualTheme.NIGHT,
    url: 'https://github.com/RobinFrcd/AerialShots/releases/download/norway-2021-v1/robinfrcd_hennigsvaer_1080p_H264.m4v',
    providerId: 'robin_aerials',
    description: 'Henningsvaer Sunset, Norway'
  }
];

// --- Audio Assets ---
export const AUDIO_ASSETS: AudioAsset[] = [
  // --- Adhan: Sheikh Muhammad Marwan Qassas (PRIORITY) ---
  {
    id: 'adhan_qassas_audio_com',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (Audio.com)',
    artist: 'Sheikh Muhammad Marwan Qassas',
    url: 'https://audio.com/a2ka-yt/audio/sheikh-mohamemd-qasas-azan'
  },
  {
    id: 'adhan_qassas_ramadan_1440',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (Ramadan 1440)',
    artist: 'Sheikh Muhammad Marwan Qassas',
    // Direct MP4 link from Archive.org (Audio content)
    url: 'https://dn710309.ca.archive.org/0/items/3rdramadan1440madeenahmaghribadhaansheikhmuhammadmarwanqassaas/3rdRamadan1440MadeenahMaghribAdhaanSheikhMuhammadMarwanQassaas.mp4'
  },
  {
    id: 'adhan_qassas_sc',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (SoundCloud)',
    artist: 'Sheikh Muhammad Marwan Qassas',
    // High Quality SoundCloud source suitable for react-player
    url: 'https://soundcloud.com/troid/adhan-madinah-1433-sheikh-muhammad-marwan-qassas'
  },
  {
    id: 'adhan_qassas_archive_hq',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (HQ Audio)',
    artist: 'Sheikh Muhammad Marwan Qassas',
    // Direct MP3 specific to Qassas
    url: 'https://archive.org/download/Adhan_Madinah_Qassas/Adhan_Madinah_Qassas.mp3'
  },

  // --- Adhan: General High Quality (Reliable Fallbacks) ---
  {
    id: 'adhan_madinah_hq_1',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (Pristine)',
    artist: 'Sheikh Essam Bukhari',
    url: 'https://archive.org/download/HaramainMuadhins/Madinah-Adhan-1.mp3'
  },
  {
    id: 'adhan_madinah_hq_2',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (Emotional)',
    artist: 'Sheikh Surayhi',
    url: 'https://archive.org/download/HaramainMuadhins/Madinah-Adhan-2.mp3'
  },
  {
    id: 'adhan_madinah_hq_3',
    type: AudioMode.ADHAN,
    title: 'Adhan Madinah (Fajr)',
    artist: 'Haramain Muadhins',
    url: 'https://archive.org/download/HaramainMuadhins/Madinah-Fajr-Adhan-1.mp3'
  },

  // --- Quran - Ahmed Ebül Kasımi ---
  {
    id: 'quran_kasimi_amenerrasulu',
    type: AudioMode.QURAN,
    title: 'Amenerrasulu (Baqarah 285-286)',
    artist: 'Ahmed Ebül Kasımi',
    url: 'https://archive.org/download/ebulkasimi/AMENERRASULU+-AHMED+EBUL+KASIMI+(256kbit).m4a'
  },
  {
    id: 'quran_kasimi_ala',
    type: AudioMode.QURAN,
    title: 'Sure-i A\'la',
    artist: 'Ahmed Ebül Kasımi',
    url: 'https://archive.org/download/ebulkasimi/ALA+SURESI+-AHMED+EBUL+KASIMI+(256kbit).m4a'
  },

  // --- Dua (Rıza Günay) ---
  {
    id: 'dua_sekine_riza',
    type: AudioMode.DUA,
    title: 'Sekine Duası',
    artist: 'Rıza Günay',
    url: 'https://archive.org/download/HafzRizaGunay/Sekine_Duasi.mp3'
  },
  {
    id: 'dua_cevsen_riza',
    type: AudioMode.DUA,
    title: 'Cevşen-ül Kebir',
    artist: 'Rıza Günay',
    url: 'https://archive.org/details/HafzRizaGunay/Cev%C5%9Fen\'%C3%BCl+Kebir+-+Radyo+Cihan+-+Tek+Par%C3%A7a+-+H%C3%BCsrev+Hatt%C4%B1+-+R%C4%B1za+G%C3%9CNAY+(T%C3%BCrk%C3%A7e+Altyaz%C4%B1+Se%C3%A7ene%C4%9Fiyle)+(256kbit).m4a'
  },

  // --- Instrumentals ---
  {
    id: 'inst_beethoven_moonlight',
    type: AudioMode.INSTRUMENTAL,
    title: 'Moonlight Sonata',
    artist: 'Beethoven',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/eb/Beethoven_Moonlight_1st_movement.ogg/Beethoven_Moonlight_1st_movement.ogg.mp3'
  },
  {
    id: 'inst_bach_air',
    type: AudioMode.INSTRUMENTAL,
    title: 'Air on the G String',
    artist: 'Bach',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/28/Johann_Sebastian_Bach_-_Orchestral_Suite_No._3_in_D_major%2C_BWV_1068_-_Air.ogg/Johann_Sebastian_Bach_-_Orchestral_Suite_No._3_in_D_major%2C_BWV_1068_-_Air.ogg.mp3'
  },
  {
    id: 'inst_bach_prelude_c',
    type: AudioMode.INSTRUMENTAL,
    title: 'Prelude in C Major',
    artist: 'Bach',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c1/Bach_-_Prelude_and_Fugue_in_C_major%2C_BWV_846_-_Kimiko_Ishizaka_piano.flac/Bach_-_Prelude_and_Fugue_in_C_major%2C_BWV_846_-_Kimiko_Ishizaka_piano.flac.mp3'
  },
  {
    id: 'inst_mozart_symphony_40',
    type: AudioMode.INSTRUMENTAL,
    title: 'Symphony No. 40 in G minor',
    artist: 'Mozart',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/06/Wolfgang_Amadeus_Mozart_-_Symphony_No._40_in_G_minor%2C_K._550_-_I._Molto_allegro.ogg/Wolfgang_Amadeus_Mozart_-_Symphony_No._40_in_G_minor%2C_K._550_-_I._Molto_allegro.ogg.mp3'
  },
  {
    id: 'inst_mozart_lacrimosa',
    type: AudioMode.INSTRUMENTAL,
    title: 'Lacrimosa (Requiem)',
    artist: 'Mozart',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/82/Mozart_Requiem_Lacrimosa.ogg/Mozart_Requiem_Lacrimosa.ogg.mp3'
  },
  {
    id: 'inst_debussy_clair',
    type: AudioMode.INSTRUMENTAL,
    title: 'Clair de Lune',
    artist: 'Debussy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/25/Debussy_Clair_de_lune.ogg/Debussy_Clair_de_lune.ogg.mp3'
  },
  {
    id: 'inst_debussy_reverie',
    type: AudioMode.INSTRUMENTAL,
    title: 'Rêverie',
    artist: 'Debussy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/eb/Claude_Debussy_-_reverie.ogg/Claude_Debussy_-_reverie.ogg.mp3'
  }
];

export const DEFAULT_QUOTE: Quote = {
  text_ar: 'اللَّهُ لَا إِلَٰهَ إِلَّa هُوَ الْحَيُّ الْقَيُّومُ',
  text_en: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.',
  source: 'Ayatul Kursi (2:255)',
  type: 'quran'
};

export const ADHAN_QUOTES_DATA: any[] = [
  { text_ar: "الله أكبر", text: { en: "God is the Greatest.", nl: "God is de Grootste.", tr: "Allah en büyüktür." }, source: "The Adhan", type: 'adhan' },
  { text_ar: "حي على الفلاح", text: { en: "Come to success.", nl: "Kom tot succes.", tr: "Haydi kurtuluşa." }, source: "The Adhan", type: 'adhan' }
];

export const DUA_QUOTES_DATA: any[] = [
  {
    text_ar: "يَا حَيُّ يَا قَيُّومُ",
    text: {
      en: "O Ever-Living One, O Self-Existing One.",
      nl: "O Levende, O Zelfbestaande.",
      tr: "Ey Hayy (Diri), Ey Kayyum (Kaim)."
    },
    source: "Sekine Duası",
    type: 'dua'
  },
  {
    text_ar: "يَا فَتَّاحُ يَا رَزَّاقُ",
    text: {
      en: "O Opener of doors, O Provider of sustenance.",
      nl: "O Opener van deuren, O Voorzorger van levensonderhoud.",
      tr: "Ey Fettah (Açan), Ey Rezzak (Rızık Veren)."
    },
    source: "Cevşen-ül Kebir",
    type: 'dua'
  },
  {
    text_ar: "يَا كَرِيمُ يَا رَحِيمُ",
    text: {
      en: "O Most Generous One, O Most Merciful One.",
      nl: "O Meest Genereuze, O Meest Barmhartige.",
      tr: "Ey Kerim (Cömert), Ey Rahim (Merhamet Eden)."
    },
    source: "Cevşen-ül Kebir",
    type: 'dua'
  },
  {
    text_ar: "يَا مُجِيبَ الدَّعَوَاتِ",
    text: {
      en: "O Answerer of prayers.",
      nl: "O Verhoorder van gebeden.",
      tr: "Ey duaları kabul eden."
    },
    source: "Cevşen-ül Kebir",
    type: 'dua'
  },
  {
    text_ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    text: {
      en: "Our Lord, grant us goodness in this world and goodness in the Hereafter.",
      nl: "Onze Heer, geef ons het goede in dit leven en het goede in het Hiernamaals.",
      tr: "Rabbimiz, bize dünyada da iyilik ver, ahirette de iyilik ver."
    },
    source: "Common Dua",
    type: 'dua'
  },
  {
    text_ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    text: {
      en: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
      nl: "Allah is voldoende voor ons, en Hij is de beste Beschermer.",
      tr: "Allah bize yeter, O ne güzel vekildir."
    },
    source: "Common Dua",
    type: 'dua'
  },
  {
    text_ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ",
    text: {
      en: "O Allah, I ask You for pardon and wellbeing.",
      nl: "O Allah, ik vraag U om vergeving en welzijn.",
      tr: "Allah'ım, senden affı ve afiyet isterim."
    },
    source: "Veysel Karani Münacatı",
    type: 'dua'
  },
  {
    text_ar: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    text: {
      en: "O Turner of hearts, make my heart firm upon Your religion.",
      nl: "O Keerder van harten, maak mijn hart vast op Uw religie.",
      tr: "Ey kalpleri çeviren, kalbimi dinin üzerinde sabit kıl."
    },
    source: "Common Dua",
    type: 'dua'
  }
];

export const SCHOLAR_QUOTES_DATA: any[] = [
  { text: { en: "Bismillah is the start of all good things.", nl: "Bismillah is het begin van alle goede dingen.", tr: "Bismillah her hayrın başıdır." }, source: "Risale-i Nur (Said Nursi)", type: 'scholar' }
];

export const FALLBACK_QUOTES_DATA: any[] = [
  { text: { en: "This too shall pass.", nl: "Ook dit gaat voorbij.", tr: "Bu da geçer yahu." }, source: "Idiom", type: 'quote' }
];

export const SAFE_QURAN_FALLBACKS: any[] = [
  { text_ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", text: { en: "For indeed, with hardship [will be] ease.", nl: "Want voorwaar, met de moeilijkheid komt verlichting.", tr: "Muhakkak ki zorlukla beraber bir kolaylık vardır." }, source: "Surah Al-Inshirah 94:5", type: 'quran' },
  { text_ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", text: { en: "Unquestionably, by the remembrance of Allah hearts are assured.", nl: "Weet dat door het gedenken van Allah de harten tot rust komen.", tr: "Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur." }, source: "Surah Ar-Ra'd 13:28", type: 'quran' }
];
