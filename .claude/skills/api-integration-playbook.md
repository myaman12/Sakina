\# Skill: API \& Pipeline Integration



When working in the `services/` directory (handling Pexels, Pixabay, Apple Aerials, Archive.org, or Gemini), follow these reliability rules:



\## Caching \& Rate Limits

\* Pexels, Pixabay, and Gemini APIs have strict rate limits.

\* Always utilize or implement in-memory caching for API responses. Do not make duplicate network requests for the same search query or prompt within the same session.



\## Fallbacks \& Error Handling

\* \*\*Video/Audio Failures:\*\* `VideoPlayer` and `AudioPlayer` must always have an `onError` callback. If an asset fails to load, it must trigger a fallback to the next track/video automatically. Silent failures are forbidden.

\* \*\*Apple Aerials:\*\* Always prioritize quality in this specific order: `4K SDR` → `4K HEVC` → `1080p`.

\* \*\*Gemini Quotes:\*\* The AI is locked to `gemini-3-flash-preview`. You must strictly enforce a \*\*16-word maximum\*\* constraint in the system prompt for quote generation to ensure it fits on screen.

