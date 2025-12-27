import { type AudioPlayer, createAudioPlayer } from "expo-audio";
import { Platform } from "react-native";
import { fromCallback } from "xstate";

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

const createWebAudio = () => {
  const AudioContextClass =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      : null;

  let ctx: AudioContext | null = null;
  let isMuted = false;

  const ensureContext = () => {
    if (!AudioContextClass) {
      return null;
    }
    if (!ctx) {
      ctx = new AudioContextClass();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  };

  const playTone = (
    freq: number,
    duration = 0.1,
    volume = 0.3,
    type: OscillatorType = "sine"
  ) => {
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

  return {
    playTone,
    playDown: () => playTone(440, 0.06, 0.4),
    playUp: () => playTone(800, 0.05, 0.3),
    playLastDown: () => {
      playTone(220, 0.25, 0.25);
      playTone(440, 0.25, 0.25);
      playTone(659.25, 0.25, 0.2);
    },
    playLastUp: () => {
      playTone(220, 0.4, 0.3);
      playTone(440, 0.4, 0.3);
      playTone(659.25, 0.4, 0.25);
    },
    playGo: () => playTone(880, 0.2, 0.45),
    playRest: () => {
      playTone(440, 0.15, 0.3);
      setTimeout(() => playTone(329.63, 0.3, 0.4), 120);
    },
    playFinish: () => {
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.5, 0.25), i * 100);
      });
    },
    playCountdownBeep: () => playTone(880, 0.05, 0.3),
    setMuted: (muted: boolean) => {
      isMuted = muted;
    },
    cleanup: () => {
      ctx?.close();
    },
  };
};

// Audio sources - require() must be called at module level for Metro bundler
const audioSources = {
  down: require("../assets/audio/down.wav"),
  up: require("../assets/audio/up.wav"),
  lastDown: require("../assets/audio/last_down.wav"),
  lastUp: require("../assets/audio/last_up.wav"),
  go: require("../assets/audio/go.wav"),
  rest: require("../assets/audio/rest.wav"),
  finish: require("../assets/audio/finish.wav"),
  countdownBeep: require("../assets/audio/countdown_beep.wav"),
};

const createNativeAudio = () => {
  let isMuted = false;

  // Preload all audio players once
  const players: Record<string, AudioPlayer> = {};

  const initPlayers = () => {
    for (const [key, source] of Object.entries(audioSources)) {
      try {
        players[key] = createAudioPlayer(source);
      } catch (e) {
        console.error(`Failed to create player for ${key}:`, e);
      }
    }
  };

  // Initialize immediately
  initPlayers();

  const playSound = (key: keyof typeof audioSources) => {
    if (isMuted) {
      return;
    }
    try {
      const player = players[key];
      if (player) {
        // Seek to start and play (allows rapid re-triggering)
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  return {
    playTone: () => playSound("countdownBeep"),
    playDown: () => playSound("down"),
    playUp: () => playSound("up"),
    playLastDown: () => playSound("lastDown"),
    playLastUp: () => playSound("lastUp"),
    playGo: () => playSound("go"),
    playRest: () => playSound("rest"),
    playFinish: () => playSound("finish"),
    playCountdownBeep: () => playSound("countdownBeep"),
    setMuted: (muted: boolean) => {
      isMuted = muted;
    },
    cleanup: () => {
      for (const player of Object.values(players)) {
        player.release();
      }
    },
  };
};

export const audioActor = fromCallback<AudioEvent>(({ receive }) => {
  const isWeb = Platform.OS === "web";
  const audio = isWeb ? createWebAudio() : createNativeAudio();

  receive((event) => {
    switch (event.type) {
      case "SET_MUTED":
        audio.setMuted(event.muted);
        break;
      case "PLAY_TONE":
        audio.playTone(event.freq, event.duration ?? 0.1, event.volume ?? 0.3);
        break;
      case "PLAY_DOWN":
        audio.playDown();
        break;
      case "PLAY_UP":
        audio.playUp();
        break;
      case "PLAY_LAST_DOWN":
        audio.playLastDown();
        break;
      case "PLAY_LAST_UP":
        audio.playLastUp();
        break;
      case "PLAY_GO":
        audio.playGo();
        break;
      case "PLAY_REST":
        audio.playRest();
        break;
      case "PLAY_FINISH":
        audio.playFinish();
        break;
      case "PLAY_COUNTDOWN_BEEP":
        audio.playCountdownBeep();
        break;
      default:
        break;
    }
  });

  return () => {
    audio.cleanup();
  };
});
