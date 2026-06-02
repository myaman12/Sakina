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

