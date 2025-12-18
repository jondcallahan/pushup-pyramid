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

  const playTone = (freq: number, duration = 0.1, volume = 0.3, type: OscillatorType = "sine") => {
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

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const playChord = (freqs: number[], duration = 1.0, volumes: number[] = []) => {
    if (isMuted) return;
    freqs.forEach((f, i) => {
      playTone(f, duration, volumes[i] ?? 0.15 / (i + 1));
    });
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
        playTone(150, 0.08, 0.4); // Deeper Tactile Click
        break;
      case "PLAY_UP":
        playTone(800, 0.05, 0.3); // Sharper Tactile Click
        break;
      case "PLAY_LAST_DOWN":
        playTone(100, 0.2, 0.5); // Resonant Thud
        playTone(300, 0.15, 0.2, "triangle"); // Metallic ring
        break;
      case "PLAY_LAST_UP":
        playTone(800, 0.1, 0.3); // Core
        playTone(1600, 0.1, 0.1); // Bright Octave
        break;
      case "PLAY_GO":
        playTone(880, 0.2, 0.45); // A5 - bright start
        break;
      case "PLAY_REST":
        playTone(440, 0.15, 0.3); // A4 - "duh"
        setTimeout(() => playTone(329.63, 0.3, 0.4), 120); // E4 - "doom"
        break;
      case "PLAY_FINISH":
        // Fanfare Arpeggio
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          setTimeout(() => playTone(f, 0.5, 0.25), i * 100);
        });
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
