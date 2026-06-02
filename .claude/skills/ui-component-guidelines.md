\# Skill: UI Component Development



When creating or editing components in the `components/` directory, adhere to the following stack and design rules:



\## Stack \& Styling

\* \*\*Framework:\*\* React 19.2 + TypeScript 5.8. Keep components functional and strictly typed.

\* \*\*Styling:\*\* Use Tailwind CSS utility classes (via CDN). Do not create custom CSS files unless absolutely necessary.

\* \*\*Icons:\*\* Only use `lucide-react` for iconography.



\## Z-Index \& Overlay Rules

\* `VideoPlayer.tsx` is the absolute background (lowest z-index).

\* `QuoteOverlay`, `InfoOverlay`, and `LocationOverlay` sit above the video.

\* `Dashboard.tsx` is the highest priority UI layer. It must always sit on top of all other overlays so the user can access settings.



\## Autoplay Constraints

\* \*\*DO NOT\*\* remove or bypass `StartOverlay.tsx`. Browsers require an initial user interaction (a click) to allow audio and video to autoplay. This splash screen is structurally required.

