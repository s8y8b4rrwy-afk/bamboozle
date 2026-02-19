# Bamboozle Technical Documentation

## Audio & Narration System

The narration system is designed to provide a premium, synchronized experience across all devices.

### Components
1. **`gameService.ts`**: The heart of the audio logic.
   - `speak()`: Entry point for narration requests.
   - `playNextPremium()`: Processes the audio queue.
   - `internalSpeak()`: Wrapper for local `speechSynthesis`.
   - `unlockAudio()`: Essential utility for mobile Safari compatibility.

2. **`ProgressionManager.ts`**: Manages the timing of game phases.
   - Relies on the `onAudioEnded` callback to advance steps in the `REVEAL` phase.
   - Implements safety timers to prevent "hanging" if audio fails to play.

3. **`audioService.ts`**: Handles sound effects (SFX) using the Web Audio API.

### Web Audio Safari Support
Safari requires an explicit user gesture to enable audio. Bamboozle solves this by:
- Using a `shared narrator element` (`narratorAudioRef`).
- Calling `unlockAudio()` on major button clicks (Join, Ready, Start).
- Manually resuming the `AudioContext` and `speechSynthesis` state.

### Server-Side Integration
When `usePremiumVoices` is enabled:
1. Host emits `requestNarrator`.
2. Server generates/fetches audio and broadcasts `playAudio` with a URL.
3. All clients (Host & Player) add the URL to their `premiumAudioQueueRef` and play it.

### Server-Side TTS Architecture
- **Provider**: Google Cloud Text-to-Speech (Neural2/Wavenet voices).
- **Storage & Caching**: 
  - Audio is hashed (MD5) based on text and language.
  - Files are stored persistently in **Google Cloud Storage (GCS)** in the `bamboozle-audio-assets` bucket.
  - This architecture ensures zero storage impact on the application server and high-speed delivery via Google's CDN.
- **Admin Dashboard**: Accessible at `/admin`, providing a UI for:
  - Batch pre-generating static narrator phrases and question/answer text.
  - Monitoring real-time generation progress and error logs.
  - Retrying failed generations with one-click logic.
  - Clearing the global cache.
- **Cleanup**: Dynamic per-room audio is no longer deleted manually; the global cache is managed via the Admin UI to maximize reuse across rooms.

## Troubleshooting

### Narrator Hangs
If the reveal sequence stops advancing:
1. Check the browser console for `[Audio] Failsafe: advancing queue`. This indicates the audio failed to load or play within 8 seconds.
2. Verify that `onAudioEnded()` is being called in both the successful and failed paths of `playNextPremium`.

### No Sound on Mobile Safari
1. Ensure `actions.unlockAudio()` is called on a user gesture (like clicking "Join").
2. Verify that `narratorAudioRef.current` is being reused instead of creating new `new Audio()` objects.

## Online Friends Mode
This mode merges the "Big Screen" visuals with the "Controller" inputs.
- Defined in `plan.md`.
- Implemented via `OnlinePlayerView.tsx`.
- Uses `RevealSequence` and `LeaderboardSequence` components from `GameSharedComponents.tsx`.
