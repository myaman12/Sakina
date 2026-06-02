# Sakina — Lessons Learned

> Uygulama-spesifik dersler. Vault-çapında geçerli dersler `_meta/lessons.md`'de (L-NNN).
> Append-only, S-NNN ID ile.

---

### S-001: Vite statik dosyaları sadece `public/` altından servis eder

**Pattern:** `youtube_catalog.json` ve `video_manifest.json` proje kökündeydi. `fetch('/youtube_catalog.json')` 404 döndü — servis boş dizi döndürdü, YouTube videoları hiç yüklenmedi.

**Don't:** JSON/statik dosyaları proje köküne koyup `fetch('/')` ile eriş.
**Do:** Vite'ta runtime'da fetch edilen tüm statik dosyalar `public/` altında olmalı.

---

### S-002: Native HTML5 `<audio>` component unmount'ta otomatik durmaz

**Pattern:** AudioPlayer'da audio.com URL'leri için native `<audio>` tag kullanılıyor (CORS bypass). React component unmount olduğunda (key değişimi → mod geçişi) `<audio>` elementi buffer'dan çalmaya devam ediyor. Sonuç: Adhan→Quran geçişinde iki ses üst üste.

**Don't:** Native `<audio>` ref kullanan component'ta cleanup'sız useEffect bırak.
**Do:** useEffect return'da `audioRef.current.pause()` + `src = ''`.

---

### S-003: Audio mode'a bağlı customQuery, tema seçimini sessizce ezer

**Pattern:** `getStreamForTheme` ADHAN/QURAN/DUA modlarında `customQuery` (mosque/surreal queries) oluşturup Pexels/Pixabay'a geçiyordu. Bu, `THEME_QUERIES[theme]`'i tamamen bypass ediyordu. Kullanıcı Mountain seçse bile cami videosu geliyordu — tema butonları kozmetikti.

**Don't:** Bir secondary concern (audio mode → visual style) birincil kullanıcı tercihini (tema seçimi) sessizce ez.
**Do:** Spiritüel atmosfer ses + quote overlay'den gelsin. Görsel tema kullanıcının açık seçimine saygı göstersin.

---

### S-004: Elapsed counter'ı ham gösterme — countdown olarak türet

**Pattern:** `elapsed.v` ve `elapsed.a` saniye olarak doğrudan gösteriliyordu (0→threshold). Kullanıcı "ne kadar kaldı?" bilgisini bekliyor, "ne kadar geçti?" değil. Ayrıca interval Dashboard'tan değiştirildiğinde elapsed sıfırlanmıyordu — eski elapsed > yeni threshold ise counter anlamsızlaşıyor veya anında tetikleniyordu.

**Don't:** Bir internal counter'ı (elapsed) doğrudan UI'da göster ve state'i kaynak parametresi değiştiğinde sıfırlamayı unut.
**Do:** UI'da türetilmiş değer göster (`remaining = threshold - elapsed`). Threshold değiştiğinde elapsed'ı sıfırla (ref ile önceki değeri karşılaştır).

---

### S-005: customQuery içeriği değiştiriyorsa UI etiketi de audioMode'dan türetilmeli

**Pattern:** Sacred/Dua modlarında `getStreamForTheme` `customQuery` ile video sorgusunu
cami/sürreal içeriğe çevirir (içerik doğru gelir). Ama dönen asset'in `theme` alanı temel
app teması olarak kalır (`pexelsService.ts:119`, `pixabayService.ts:68`). `LocationOverlay`
kategori etiketini `asset.theme`'den türetince çelişki: Kur'an modunda cami videosu
"Mountain - Surreal" etiketleniyordu (başlıktaki "aerial" → `isSurreal=true`). Hem pexels
hem pixabay'de aynı; tekil değil.

**Don't:** UI etiketini yalnız temel `theme`'den türet; override edilen modda bayat kalır.
Yanıltıcı surreal-tag'i de tetikler.
**Do:** İçerik kategorisini değiştiren mod (QURAN/ADHAN → "Sacred", DUA → "Celestial")
için etiketi `audioMode`'dan türet (`LocationOverlay.tsx:43`). Tam veri-doğruluğu için
ileride asset'e override'ı yansıtan `category` alanı yaz — services katmanında, caching
(api-integration-playbook) + Dua surreal-scoring (CHANGELOG #6) korunarak.

**Not (S-003 ile gerilim):** S-003 customQuery override'ının kaldırıldığını belgeliyor;
güncel kodda sacred-mod customQuery **geri eklenmiş** (sacred görseller niyeti, CHANGELOG #6
Dua). S-005 bu override'ı kabul eder ve yalnız **etiket türetimini** düzeltir — birincil
kullanıcı tema seçimi ayrı konu (S-003).

**Origin:** `_meta/sessions/apps/_log.md` 2026-05-31 — LocationOverlay etiket fix (Yaklaşım 1)

---
