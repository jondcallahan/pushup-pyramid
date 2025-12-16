import { fromCallback } from "xstate";

/**
 * Audio Events that can be sent to this actor
 */
export type AudioEvent =
  | { type: "PLAY_TONE"; freq: number; duration?: number; volume?: number }
  | { type: "PLAY_DOWN" }
  | { type: "PLAY_UP" }
  | { type: "PLAY_LAST_DOWN" }
  | { type: "PLAY_LAST_UP" }
  | { type: "PLAY_GO" }
  | { type: "PLAY_REST" }
  | { type: "PLAY_FINISH" }
  | { type: "PLAY_COUNTDOWN_BEEP" }
  | { type: "SET_MUTED"; muted: boolean };

/**
 * Audio Actor
 * Owns the AudioContext and handles all sound playback.
 * Receives events from the main machine to play sounds.
 */
export const audioActor = fromCallback<AudioEvent>(({ receive }) => {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  let ctx: AudioContext | null = null;
  let isMuted = false;

  const ensureContext = () => {
    if (!ctx) {
      ctx = new AudioContextClass();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  };

  const playTone = (freq: number, duration = 0.1, volume = 0.3) => {
    if (isMuted) {
      return;
    }

    const audioCtx = ensureContext();
    if (!audioCtx) {
      return;
    }

    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  receive((event) => {
    switch (event.type) {
      case "SET_MUTED":
        isMuted = event.muted;
        break;
      case "PLAY_TONE":
        playTone(event.freq, event.duration ?? 0.1, event.volume ?? 0.3);
        break;
      case "PLAY_DOWN":
        playTone(440, 0.06, 0.4); // A4 - short tick
        break;
      case "PLAY_UP":
        playTone(440, 0.15, 0.5); // A4 - longer
        break;
      case "PLAY_LAST_DOWN":
        // Octave Power chord - punchy with resonance
        playTone(220, 0.25, 0.25); // A3 - low root
        playTone(440, 0.25, 0.25); // A4 - octave
        playTone(659.25, 0.25, 0.2); // E5 - fifth
        break;
      case "PLAY_LAST_UP":
        // Octave Power chord - full resonance
        playTone(220, 0.4, 0.3); // A3 - low root
        playTone(440, 0.4, 0.3); // A4 - octave
        playTone(659.25, 0.4, 0.25); // E5 - fifth
        break;
      case "PLAY_GO":
        playTone(880, 0.2, 0.45); // A5 - bright start
        break;
      case "PLAY_REST":
        playTone(440, 0.15, 0.3); // A4 - "duh"
        setTimeout(() => playTone(329.63, 0.3, 0.4), 120); // E4 - "doom"
        break;
      case "PLAY_FINISH":
        playTone(880, 0.15, 0.3); // A5
        setTimeout(() => playTone(1108.73, 0.3, 0.4), 150); // C#6
        break;
      case "PLAY_COUNTDOWN_BEEP":
        playTone(880, 0.05, 0.3); // A5
        break;
      default:
        break;
    }
  });

  // Cleanup
  return () => {
    ctx?.close();
  };
});
