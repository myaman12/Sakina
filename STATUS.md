# Sakina — Status & Architecture Snapshot

**Last Update:** 2026-05-31 (v3 — LocationOverlay kategori etiketi audioMode'dan türetiliyor; v2 — countdown sync fix)
**Location:** `apps/sakina/`
**Origin:** `D:\Yaman_Apps\sakina_v2.8` (Sheikh Qassas Edition)
**Dev:** `npm run dev` → `http://localhost:3000`
**Build:** `npm run build` → `dist/`
**Test:** `npm run test` (Vitest)

## Stack

React 19.2 + TypeScript 5.8 + Vite 6.2 + Tailwind CSS

## Architecture

```
App.tsx                  — Orchestrator: state, tick engine (20s/1m/3m), audio priority
├── components/
│   ├── VideoPlayer.tsx  — Hybrid: <video> double-buffer (MP4) + ReactPlayer (YouTube)
│   ├── AudioPlayer.tsx  — ReactPlayer + native <audio> (audio.com CORS bypass)
│   ├── Dashboard.tsx    — Control Center (Audio Mode, Theme, Shuffle, Quotes)
│   ├── QuoteOverlay.tsx — AI-curated wisdom overlay
│   ├── InfoOverlay.tsx  — Gradient info bar
│   ├── LocationOverlay  — Video source + metadata (kategori etiketi audioMode'dan: QURAN/ADHAN→Sacred, DUA→Celestial; bkz S-005)
│   └── StartOverlay.tsx — Autoplay policy gate
├── services/
│   ├── streamService.ts — Video orchestrator: aggregate + score + blacklist
│   ├── youtubeService   — YouTube catalog reader (public/youtube_catalog.json)
│   ├── pexelsService    — Pexels API (4K priority, in-memory cache)
│   ├── pixabayService   — Pixabay API (similar pattern)
│   ├── appleAerialsService — Apple TV Aerials (sylvan.apple.com)
│   ├── audioService     — Archive.org dynamic audio loader
│   ├── contentService   — Quote selection engine (alquran.cloud + local)
│   └── geminiService    — Gemini Flash AI quote curation (16-word cap)
├── constants.ts         — Static assets, providers, audio manifest, quotes
├── types.ts             — Interfaces & enums (VideoAsset, AudioAsset, modes, themes)
└── public/
    ├── youtube_catalog.json  — 94 curated YouTube 4K videos (6 channels, 5 themes)
    └── video_manifest.json   — Static video manifest (Robin Aerials etc.)
```

## Video Providers (5)

| Provider | Kaynak | Theme-aware | Cache |
|----------|--------|-------------|-------|
| YouTube | `youtube_catalog.json` (statik, yt-dlp ile oluşturuldu) | ✓ tema filtre | in-memory |
| Pexels | API (`THEME_QUERIES[theme]`) | ✓ sorgu bazlı | in-memory |
| Pixabay | API (aynı desen) | ✓ sorgu bazlı | in-memory |
| Apple Aerials | `sylvan.apple.com` manifest | ✓ kategori→tema map | in-memory |
| Video Manifest | `public/video_manifest.json` | ✓ tema filtre | — |

## Audio Modes (4)

- **ADHAN** — Sheikh Qassas priority (Audio.com #1, alternating), Madinah HQ backup
- **QURAN** — Surah An-Nur (Al-Kurdi) start, Al-Kurdi/Mahir/Kasimi/Rıza Günay
- **DUA** — Cevşen-ül Kebir → Sekine sequence, Quran-filtered pool
- **INSTRUMENTAL** — Bach/Mozart/Debussy/Beethoven (7 tracks, Wikimedia)

## Visual Themes (6)

Nature, Mountain, Water, Night, Space, Micro — Dashboard'tan seçilir veya Random (otomatik rotasyon)

## Key Constraints (CLAUDE.md'den)

- App.tsx tick engine'a dokunmadan önce shuffle interval etkisini kontrol et
- Services'te rate limiting — yeni sorgular mevcut cache mekanizmasını kullanmalı
- Gemini model `gemini-3-flash-preview` kilitli, değiştirme
- StartOverlay yapısal olarak zorunlu (autoplay policy bypass)
- VideoPlayer/AudioPlayer `onError` MUTLAKA fire etmeli — sessiz hata yasak

## Known Issues

- `streamService.ts:109` — `calculateAssetScore(c, theme)` parametre tipi uyumsuz (VisualTheme vs AudioMode); pre-existing, Vite build'i etkilemiyor
- `--dry-run` state persist bug (ingest pipeline, sakina ile ilgisiz)
- **Metadata mislabel (kalan kök sorun):** `pexels/pixabayService` `customQuery` ile içerik kategorisi değişse de asset.`theme`'i temel app teması olarak bırakır. UI etiketi v3'te audioMode'dan türetilerek çözüldü (LocationOverlay); tam veri-doğruluğu için asset'e `category` alanı yazmak ayrı iş (S-005 Yaklaşım 2)

## YouTube Catalog Dağılımı

nature: 50 | mountain: 23 | water: 10 | space: 7 | night: 4 | micro: 0 (Pexels/Pixabay kapsar)

Kanallar: RelaxationFilm (birincil), SpaceRip, Space Videos, Nature Relaxation Films, Relaxation Film
