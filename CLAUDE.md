\# Sakina v2.8 — AI Coding Assistant Guide



\## Purpose (WHY)

Sakina is a spiritual ambient wallpaper app built with React, TypeScript, and Vite. It orchestrates cinematic video backgrounds alongside Islamic audio (Adhan, Quran, Dua, Instrumentals) with AI-curated quotes overlaid on screen.



\## Repo Map (WHAT)

\* `App.tsx`: Main orchestrator, manages state, tick engine, and audio priority.

\* `components/`: UI layer (VideoPlayer, AudioPlayer, Overlays, Dashboard).

\* `services/`: Data pipelines. 

&nbsp;   \* Video: `streamService.ts`, `pexelsService.ts`, `pixabayService.ts`, `appleAerialsService.ts`

&nbsp;   \* Audio: `audioService.ts` (Archive.org)

&nbsp;   \* Content: `contentService.ts`, `geminiService.ts`

\* `tests/`: Core logic testing (e.g., `audioPriority.test.ts`).

\* `docs/`: Detailed architecture, API behaviors, and logic documentation.



\## Working Rules \& Commands (HOW)

\* \*\*Stack:\*\* React 19.2, TypeScript 5.8, Vite 6.2, Tailwind CSS.

\* \*\*Commands:\*\*

&nbsp;   \* Dev: `npm run dev`

&nbsp;   \* Build: `npm run build`

&nbsp;   \* Test: `npm run test` (Crucial: always run after touching audio logic).

\* \*\*Code Rules:\*\* \* Do not modify `App.tsx`'s tick engine without checking the impact on shuffle intervals (20s/1m/3m).

&nbsp;   \* Keep components pure where possible; heavy logic belongs in `services/`.

