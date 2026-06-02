\# UI Layer Constraints

\* \*\*Autoplay Policies:\*\* `StartOverlay.tsx` is structurally required to bypass browser autoplay restrictions. Do not attempt to bypass or remove the initial user interaction button.

\* \*\*Media Fallbacks:\*\* `VideoPlayer.tsx` and `AudioPlayer.tsx` must always fire `onError` to trigger the next track/video. Silent failures are not allowed.

