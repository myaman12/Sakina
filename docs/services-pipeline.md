\### 2. Create `docs/services-pipeline.md`

This file explains how data is fetched, scored, and mapped across your various external APIs.



```markdown

\# Services \& Data Pipelines



\## Video Pipeline

\* \*\*streamService:\*\* The central video orchestrator. It aggregates videos from all providers, applies blacklist filtering for broken links, and scores them. \*\*Note:\*\* 4K resolution and "Surreal" themes receive priority scoring to return the best match.

\* \*\*pexelsService:\*\* Fetches 4K/HD videos from the Pexels API using theme-mapped queries (e.g., "volcano eruption aerial 4k"). Implements in-memory caching.

\* \*\*pixabayService:\*\* Fetches videos from the Pixabay API using similar theme queries, caching, and quality prioritization.

\* \*\*appleAerialsService:\*\* Fetches Apple TV aerial screensavers directly from `sylvan.apple.com`. Maps Apple categories to Sakina visual themes. Prioritizes format: `4K SDR` → `4K HEVC` → `1080p`.



\## Audio Pipeline

\* \*\*audioService:\*\* Dynamically loads audio from Archive.org metadata APIs. Handles 5 reciters/artists: Rıza Günay, Ahmed Ebül Kasımi, Sheikh Qassas, Muhammed Al-Kurdi, Mahir Al-Muaiqly. Classifies fetched files as Quran, Dua, or Adhan based on keyword matching.



\## Content Pipeline

\* \*\*contentService:\*\* The quote selection engine. Maps playing audio to contextually relevant quotes. Uses `alquran.cloud` API for Quran verses (includes 114 Surah-to-ayah mappings), and local datasets for Dua, Adhan, or Scholar quotes. Falls back to `dummyjson.com` for generic quotes.

\* \*\*geminiService:\*\* AI curation via Google Gemini (`gemini-3-flash-preview`). Generates contextually-aware quotes matching the current video, audio mode, time of day, and language. \*\*Strict Constraint:\*\* Outputs are capped at a 16-word maximum to fit the UI.

3\. Create docs/audio-algorithm.md

This file expands on the complex logic required to shuffle and queue tracks correctly without repeating.



Markdown

\# Audio Selection Algorithm



The core logic for audio selection is located in `App.tsx` (`selectAudioForTheme`). It handles state management, prioritization, and anti-repeat logic.



\## Mode-Specific Routing

\* \*\*Adhan Mode:\*\* Operates on a strict, rotating priority list:

&nbsp;   1. Qassas Audio.com

&nbsp;   2. Qassas Ramadan

&nbsp;   3. Qassas SC

&nbsp;   4. Archive HQ

&nbsp;   5. Madinah HQ

&nbsp;   \*Behavior:\* The top priority track alternates every time a shuffle is triggered.

\* \*\*Dua Mode:\*\* \* Always initializes with the "Cevşen" track.

&nbsp;   \* \*\*Sequence Rule:\*\* If the currently playing track is "Sekine", the engine must queue and play "Cevşen" next.

&nbsp;   \* \*\*Filtering:\*\* The algorithm strictly filters out any Quran recitations from the Dua audio pool.



\## History-Aware Anti-Repeat

To ensure variety and prevent listener fatigue, the random selection algorithm is heavily history-aware.

\* It maintains an array of the last 30 played track IDs.

\* Before finalizing the selection of a new track, it verifies the ID against this history array. If it exists, it redraws.

