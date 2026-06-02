\# Services Constraints

\* \*\*Rate Limiting:\*\* Pexels, Pixabay, and Gemini have strict API limits. Ensure all new queries utilize the existing in-memory caching mechanism.

\* \*\*Apple Aerials:\*\* Relies on `sylvan.apple.com`. Always maintain the fallback structure (4K SDR -> 4K HEVC -> 1080p).

\* \*\*Gemini Service:\*\* The model is locked to `gemini-3-flash-preview`. DO NOT change the model version. Enforce the 16-word maximum output constraint strictly.

