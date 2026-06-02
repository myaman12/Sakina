# Hook: Audio Logic Guardrail

**Trigger:** Any modification to `App.tsx` (specifically the `selectAudioForTheme` function) or `services/audioService.ts`.

**Required Action:**
1. Before finalizing any code changes in these files, you MUST ensure the audio selection logic remains intact.
2. You MUST prompt the user to run the test suite using `npm run test` to execute `tests/audioPriority.test.ts`.
3. Do not proceed with further features or commits until the user confirms the tests have passed. The Adhan priority ordering, Dua sequence (Sekine → Cevşen), and blacklisting logic are critical and fragile.