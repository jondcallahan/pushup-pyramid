import { Play, X } from "lucide-react";
import { useState } from "react";

type SoundStyleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SoundStyle = "current" | "apple" | "sonos" | "adobe";

const getAudioContext = (): AudioContext => {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new AudioContextClass();
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

type ToneOptions = {
  ctx: AudioContext;
  freq: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
};

const playTone = ({
  ctx,
  freq,
  duration,
  volume,
  type = "sine",
}: ToneOptions) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
};

const playToneWarm = (
  ctx: AudioContext,
  freq: number,
  duration: number,
  volume: number
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.setValueAtTime(volume, now + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
};

const playToneWithReverb = (
  ctx: AudioContext,
  freq: number,
  duration: number,
  volume: number
) => {
  playToneWarm(ctx, freq, duration, volume);
  setTimeout(
    () =>
      playTone({ ctx, freq, duration: duration * 0.7, volume: volume * 0.15 }),
    60
  );
  setTimeout(
    () =>
      playTone({ ctx, freq, duration: duration * 0.5, volume: volume * 0.08 }),
    120
  );
  setTimeout(
    () =>
      playTone({
        ctx,
        freq: freq * 1.002,
        duration: duration * 0.4,
        volume: volume * 0.05,
      }),
    180
  );
};

const playNoiseTransient = (
  ctx: AudioContext,
  duration: number,
  volume: number
) => {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
};

const triggerHaptic = (pattern: number[]) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// CURRENT STYLE - Pure sine waves (what's in the app now)
// =============================================================================
const playCurrentStyle = {
  down: (ctx: AudioContext) => {
    playTone({ ctx, freq: 440, duration: 0.06, volume: 0.4 });
  },
  up: (ctx: AudioContext) => {
    playTone({ ctx, freq: 800, duration: 0.05, volume: 0.3 });
  },
  lastDown: (ctx: AudioContext) => {
    playTone({ ctx, freq: 220, duration: 0.25, volume: 0.25 });
    playTone({ ctx, freq: 440, duration: 0.25, volume: 0.25 });
    playTone({ ctx, freq: 659.25, duration: 0.25, volume: 0.2 });
  },
  lastUp: (ctx: AudioContext) => {
    playTone({ ctx, freq: 220, duration: 0.4, volume: 0.3 });
    playTone({ ctx, freq: 440, duration: 0.4, volume: 0.3 });
    playTone({ ctx, freq: 659.25, duration: 0.4, volume: 0.25 });
  },
  rest: (ctx: AudioContext) => {
    playTone({ ctx, freq: 440, duration: 0.15, volume: 0.3 });
    setTimeout(
      () => playTone({ ctx, freq: 329.63, duration: 0.3, volume: 0.4 }),
      120
    );
  },
  finish: (ctx: AudioContext) => {
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(
        () => playTone({ ctx, freq: f, duration: 0.5, volume: 0.25 }),
        i * 100
      );
    });
  },
  countdown: (ctx: AudioContext, _count: number) => {
    playTone({ ctx, freq: 880, duration: 0.05, volume: 0.3 });
  },
};

// =============================================================================
// APPLE STYLE - Haptic-first, attack transients, physical feel
// =============================================================================
const playAppleStyle = {
  down: (ctx: AudioContext) => {
    playNoiseTransient(ctx, 0.008, 0.25);
    playTone({ ctx, freq: 1000, duration: 0.035, volume: 0.35 });
    triggerHaptic([8]);
  },
  up: (ctx: AudioContext) => {
    playNoiseTransient(ctx, 0.005, 0.15);
    playTone({ ctx, freq: 1400, duration: 0.025, volume: 0.2 });
    triggerHaptic([5]);
  },
  lastDown: (ctx: AudioContext) => {
    playNoiseTransient(ctx, 0.015, 0.4);
    playTone({ ctx, freq: 150, duration: 0.2, volume: 0.4 });
    playTone({ ctx, freq: 300, duration: 0.15, volume: 0.2, type: "triangle" });
    triggerHaptic([25, 10, 25]);
  },
  lastUp: (ctx: AudioContext) => {
    playNoiseTransient(ctx, 0.01, 0.3);
    playTone({ ctx, freq: 1200, duration: 0.15, volume: 0.35 });
    playTone({ ctx, freq: 2400, duration: 0.1, volume: 0.15 });
    triggerHaptic([15, 30, 15]);
  },
  rest: (ctx: AudioContext) => {
    playNoiseTransient(ctx, 0.008, 0.2);
    playTone({ ctx, freq: 523.25, duration: 0.35, volume: 0.3 });
    triggerHaptic([12]);
  },
  finish: (ctx: AudioContext) => {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    for (const [i, f] of freqs.entries()) {
      setTimeout(() => {
        playNoiseTransient(ctx, 0.006, 0.2);
        playTone({ ctx, freq: f, duration: 0.4, volume: 0.25 });
        triggerHaptic([10]);
      }, i * 80);
    }
    setTimeout(() => triggerHaptic([30, 20, 30, 20, 50]), 350);
  },
  countdown: (ctx: AudioContext, count: number) => {
    const freqs = [987.77, 880, 783.99]; // B5, A5, G5
    const idx = Math.max(0, Math.min(2, 3 - count));
    playNoiseTransient(ctx, 0.006, 0.2);
    playTone({ ctx, freq: freqs[idx], duration: 0.08, volume: 0.35 });
    triggerHaptic([10 + (3 - count) * 5]);
  },
};

// =============================================================================
// SONOS STYLE - Warm, premium, room-filling
// =============================================================================
const playSonosStyle = {
  down: (ctx: AudioContext) => {
    playToneWarm(ctx, 440, 0.06, 0.3);
    playTone({ ctx, freq: 220, duration: 0.06, volume: 0.1 });
  },
  up: (ctx: AudioContext) => {
    playToneWarm(ctx, 660, 0.05, 0.25);
    playTone({ ctx, freq: 330, duration: 0.05, volume: 0.08 });
  },
  lastDown: (ctx: AudioContext) => {
    playToneWarm(ctx, 220, 0.3, 0.3);
    playToneWarm(ctx, 330, 0.28, 0.25);
    playToneWarm(ctx, 440, 0.26, 0.2);
    playTone({ ctx, freq: 110, duration: 0.35, volume: 0.15 });
  },
  lastUp: (ctx: AudioContext) => {
    playToneWarm(ctx, 440, 0.4, 0.3);
    playToneWarm(ctx, 660, 0.35, 0.25);
    playToneWarm(ctx, 880, 0.3, 0.2);
    playTone({ ctx, freq: 220, duration: 0.45, volume: 0.15 });
  },
  rest: (ctx: AudioContext) => {
    const freqs = [261.63, 392, 523.25, 783.99];
    for (const [i, f] of freqs.entries()) {
      playToneWithReverb(ctx, f, 1.2, 0.12 - i * 0.02);
    }
  },
  finish: (ctx: AudioContext) => {
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    for (const [i, f] of freqs.entries()) {
      setTimeout(() => {
        playToneWithReverb(ctx, f, 0.8, 0.2);
        playTone({ ctx, freq: f / 2, duration: 0.6, volume: 0.1 });
      }, i * 120);
    }
  },
  countdown: (ctx: AudioContext, count: number) => {
    const freqs = [880, 783.99, 698.46];
    const idx = Math.max(0, Math.min(2, 3 - count));
    playToneWarm(ctx, freqs[idx], 0.1, 0.3);
  },
};

// =============================================================================
// ADOBE STYLE - Minimal, subliminal, non-fatiguing
// =============================================================================
const playAdobeStyle = {
  down: (ctx: AudioContext) => {
    playTone({ ctx, freq: 1200, duration: 0.02, volume: 0.18 });
  },
  up: (ctx: AudioContext) => {
    playTone({ ctx, freq: 1600, duration: 0.015, volume: 0.12 });
  },
  lastDown: (ctx: AudioContext) => {
    playTone({ ctx, freq: 800, duration: 0.06, volume: 0.3 });
    playTone({ ctx, freq: 1600, duration: 0.04, volume: 0.15 });
  },
  lastUp: (ctx: AudioContext) => {
    playTone({ ctx, freq: 1046.5, duration: 0.08, volume: 0.3 });
    playTone({ ctx, freq: 2093, duration: 0.06, volume: 0.12 });
  },
  rest: (ctx: AudioContext) => {
    playTone({ ctx, freq: 523.25, duration: 0.3, volume: 0.25 });
  },
  finish: (ctx: AudioContext) => {
    playTone({ ctx, freq: 783.99, duration: 0.3, volume: 0.2 });
    setTimeout(
      () => playTone({ ctx, freq: 1046.5, duration: 0.4, volume: 0.25 }),
      150
    );
  },
  countdown: (ctx: AudioContext, _count: number) => {
    playTone({ ctx, freq: 1000, duration: 0.03, volume: 0.2 });
  },
};

// =============================================================================
// STYLE CONFIGURATION
// =============================================================================

const STYLES: { id: SoundStyle; name: string; description: string }[] = [
  {
    id: "current",
    name: "Current",
    description: "Pure sine waves, functional",
  },
  {
    id: "apple",
    name: "Apple",
    description: "Haptic-first, attack transients, physical",
  },
  {
    id: "sonos",
    name: "Sonos",
    description: "Warm, premium, room-filling",
  },
  {
    id: "adobe",
    name: "Adobe",
    description: "Minimal, subliminal, non-fatiguing",
  },
];

const SOUNDS = [
  { id: "down", label: "Down" },
  { id: "up", label: "Up" },
  { id: "lastDown", label: "Last Down" },
  { id: "lastUp", label: "Last Up" },
  { id: "rest", label: "Rest" },
  { id: "finish", label: "Finish" },
  { id: "countdown", label: "Countdown (3→1)" },
] as const;

const getStylePlayer = (style: SoundStyle) => {
  switch (style) {
    case "apple":
      return playAppleStyle;
    case "sonos":
      return playSonosStyle;
    case "adobe":
      return playAdobeStyle;
    default:
      return playCurrentStyle;
  }
};

const getStyleButtonClass = (
  style: SoundStyle,
  isSelected: boolean
): string => {
  if (!isSelected) {
    return "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800";
  }
  switch (style) {
    case "apple":
      return "border-2 border-sky-500 bg-sky-500/20";
    case "sonos":
      return "border-2 border-amber-500 bg-amber-500/20";
    case "adobe":
      return "border-2 border-violet-500 bg-violet-500/20";
    default:
      return "border-2 border-zinc-500 bg-zinc-500/20";
  }
};

const getSoundButtonClass = (style: SoundStyle): string => {
  switch (style) {
    case "apple":
      return "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20";
    case "sonos":
      return "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20";
    case "adobe":
      return "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20";
    default:
      return "bg-zinc-800 text-zinc-300 hover:bg-zinc-700";
  }
};

const getPlayAllButtonClass = (style: SoundStyle): string => {
  switch (style) {
    case "apple":
      return "bg-sky-500 text-white hover:bg-sky-400";
    case "sonos":
      return "bg-amber-500 text-black hover:bg-amber-400";
    case "adobe":
      return "bg-violet-500 text-white hover:bg-violet-400";
    default:
      return "bg-zinc-700 text-white hover:bg-zinc-600";
  }
};

const getStyleDescription = (style: SoundStyle): string => {
  switch (style) {
    case "current":
      return "Pure sine wave oscillators. Functional and clear, but can feel clinical over long workouts.";
    case "apple":
      return "Inspired by Apple Watch workouts. Features attack transients (click at sound start), haptic feedback, and sounds that feel physical rather than electronic. Countdown has descending tension.";
    case "sonos":
      return "Premium audio feel with warm sub-harmonics, soft attack curves, and reverb tails. Sounds fill the space and feel expensive.";
    case "adobe":
      return "Minimal and non-fatiguing. Repetitive sounds are nearly subliminal so they don't interrupt flow. State changes get more presence.";
    default:
      return "";
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

const SoundStyleModal = ({ isOpen, onClose }: SoundStyleModalProps) => {
  const [selectedStyle, setSelectedStyle] = useState<SoundStyle>("current");

  if (!isOpen) {
    return null;
  }

  const playSound = (soundId: string) => {
    const ctx = getAudioContext();
    const player = getStylePlayer(selectedStyle);

    switch (soundId) {
      case "down":
        player.down(ctx);
        break;
      case "up":
        player.up(ctx);
        break;
      case "lastDown":
        player.lastDown(ctx);
        break;
      case "lastUp":
        player.lastUp(ctx);
        break;
      case "rest":
        player.rest(ctx);
        break;
      case "finish":
        player.finish(ctx);
        break;
      case "countdown":
        player.countdown(ctx, 3);
        setTimeout(() => player.countdown(getAudioContext(), 2), 1000);
        setTimeout(() => player.countdown(getAudioContext(), 1), 2000);
        break;
      default:
        break;
    }
  };

  const playAllSounds = () => {
    const ctx = getAudioContext();
    const player = getStylePlayer(selectedStyle);

    let delay = 0;

    // Countdown
    player.countdown(ctx, 3);
    setTimeout(() => player.countdown(getAudioContext(), 2), 1000);
    setTimeout(() => player.countdown(getAudioContext(), 1), 2000);
    delay = 3000;

    // Simulate a mini set
    setTimeout(() => player.down(getAudioContext()), delay);
    delay += 500;
    setTimeout(() => player.up(getAudioContext()), delay);
    delay += 500;
    setTimeout(() => player.down(getAudioContext()), delay);
    delay += 500;
    setTimeout(() => player.up(getAudioContext()), delay);
    delay += 500;
    setTimeout(() => player.lastDown(getAudioContext()), delay);
    delay += 600;
    setTimeout(() => player.lastUp(getAudioContext()), delay);
    delay += 600;
    setTimeout(() => player.rest(getAudioContext()), delay);
    delay += 1500;
    setTimeout(() => player.finish(getAudioContext()), delay);
  };

  const styleConfig = STYLES.find((s) => s.id === selectedStyle);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-zinc-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/50 p-6">
          <div>
            <h2 className="font-black text-2xl text-white uppercase italic tracking-tight">
              Sound Styles
            </h2>
            <p className="text-sm text-zinc-400">
              Compare Apple, Sonos, and Adobe approaches
            </p>
          </div>
          <button
            className="rounded-full p-2 transition-colors hover:bg-zinc-800"
            onClick={onClose}
            type="button"
          >
            <X className="text-zinc-500" size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Style Selector */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STYLES.map((style) => (
              <button
                className={`rounded-xl p-3 text-left transition-all ${getStyleButtonClass(style.id, selectedStyle === style.id)}`}
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                type="button"
              >
                <div className="font-bold text-sm text-white">{style.name}</div>
                <div className="text-[10px] text-zinc-400">
                  {style.description}
                </div>
              </button>
            ))}
          </div>

          {/* Style Description */}
          <div className="mb-6 rounded-xl bg-zinc-800/50 p-4">
            <h3 className="mb-2 font-bold text-white">
              {styleConfig?.name} Style
            </h3>
            <p className="text-sm text-zinc-400">
              {getStyleDescription(selectedStyle)}
            </p>
          </div>

          {/* Sound Grid */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {SOUNDS.map((sound) => (
              <button
                className={`flex items-center justify-between rounded-xl p-4 transition-all active:scale-95 ${getSoundButtonClass(selectedStyle)}`}
                key={sound.id}
                onClick={() => playSound(sound.id)}
                type="button"
              >
                <span className="font-medium text-xs">{sound.label}</span>
                <Play fill="currentColor" size={12} />
              </button>
            ))}
          </div>

          {/* Play All Button */}
          <button
            className={`w-full rounded-xl py-4 font-bold uppercase tracking-wide transition-all active:scale-[0.98] ${getPlayAllButtonClass(selectedStyle)}`}
            onClick={playAllSounds}
            type="button"
          >
            ▶ Play Full Demo Sequence
          </button>
        </div>

        {/* Footer */}
        <div className="border-zinc-800 border-t bg-zinc-900/50 p-6">
          <button
            className="w-full rounded-xl bg-white py-4 font-black text-black uppercase tracking-widest shadow-lg shadow-white/5 transition-colors hover:bg-zinc-200"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundStyleModal;
