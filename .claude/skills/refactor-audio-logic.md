\# Skill: Audio Logic \& Priority Management



When working on `App.tsx` or `services/audioService.ts`, you MUST follow these strict audio selection algorithms:



\## 1. Adhan Priority Sequence

Adhan mode is not purely random. It uses a strict priority list that alternates the top priority every shuffle. The exact sequence is:

1\. Qassas Audio.com

2\. Qassas Ramadan

3\. Qassas SC

4\. Archive HQ

5\. Madinah HQ



\## 2. Dua Sequence

\* Always start with the "Cevşen" track if initializing Dua mode.

\* \*\*Chaining Rule:\*\* If the current playing track is "Sekine", the NEXT track must strictly be "Cevşen". 

\* Ensure Quran recitations are completely filtered out of the Dua pool.



\## 3. General Anti-Repeat Logic

\* All random selection must be history-aware. 

\* The system tracks the last 30 plays. Do not select a track if its ID exists in the recent history array.



\## 4. Testing Requirement

If you modify `selectAudioForTheme` or any related logic, remind the user to run `npm run test` to execute `tests/audioPriority.test.ts`.

