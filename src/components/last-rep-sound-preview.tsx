import { Play, X } from "lucide-react";

type LastRepSoundPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
};

const getAudioContext = (): AudioContext => {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new AudioContextClass();
};

// =============================================================================
// LAST DOWN VARIATIONS
// =============================================================================

const lastDownVariations = {
  // Current: Power chord
  current: (ctx: AudioContext) => {
    playTone(ctx, 220, 0.25, 0.25);
    playTone(ctx, 440, 0.25, 0.25);
    playTone(ctx, 659.25, 0.25, 0.2);
  },

  // V1: Deep impact - low thud with click attack
  deepImpact: (ctx: AudioContext) => {
    // Click transient
    playNoise(ctx, 0.015, 0.5, 1500);
    // Deep thud
    playTone(ctx, 80, 0.3, 0.5);
    playTone(ctx, 160, 0.25, 0.3);
    // Haptic
    triggerHaptic([30, 15, 30]);
  },

  // V2: Warning siren - descending urgent tone
  warning: (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    triggerHaptic([40]);
  },

  // V3: Double tap - two quick hits
  doubleTap: (ctx: AudioContext) => {
    playTone(ctx, 150, 0.08, 0.4);
    playNoise(ctx, 0.01, 0.3, 2000);
    setTimeout(() => {
      playTone(ctx, 200, 0.1, 0.45);
      playNoise(ctx, 0.01, 0.35, 2000);
    }, 100);
    triggerHaptic([15, 50, 25]);
  },

  // V4: Tension build - rising intensity
  tension: (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    // Add sub
    playTone(ctx, 100, 0.2, 0.25);
    triggerHaptic([50]);
  },

  // V5: Punch - short aggressive hit
  punch: (ctx: AudioContext) => {
    playNoise(ctx, 0.02, 0.6, 800);
    playTone(ctx, 100, 0.15, 0.5);
    playTone(ctx, 200, 0.12, 0.35);
    playTone(ctx, 400, 0.08, 0.2);
    triggerHaptic([40]);
  },

  // V6: Alarm - attention-grabbing
  alarm: (ctx: AudioContext) => {
    playTone(ctx, 880, 0.08, 0.35);
    setTimeout(() => playTone(ctx, 660, 0.08, 0.35), 90);
    setTimeout(() => playTone(ctx, 880, 0.12, 0.4), 180);
    triggerHaptic([20, 30, 20]);
  },
};

// =============================================================================
// LAST UP VARIATIONS
// =============================================================================

const lastUpVariations = {
  // Current: Power chord (longer)
  current: (ctx: AudioContext) => {
    playTone(ctx, 220, 0.4, 0.3);
    playTone(ctx, 440, 0.4, 0.3);
    playTone(ctx, 659.25, 0.4, 0.25);
  },

  // V1: Triumph - rising arpeggio burst
  triumph: (ctx: AudioContext) => {
    const freqs = [440, 554, 659, 880];
    for (const [i, f] of freqs.entries()) {
      setTimeout(() => {
        playTone(ctx, f, 0.3, 0.3);
        if (i === 3) triggerHaptic([30, 20, 40]);
      }, i * 50);
    }
  },

  // V2: Release - satisfying exhale sound
  release: (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.setValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);

    triggerHaptic([50]);
  },

  // V3: Ding - clean bell-like confirmation
  ding: (ctx: AudioContext) => {
    playTone(ctx, 1046.5, 0.4, 0.35); // C6
    playTone(ctx, 2093, 0.3, 0.15); // C7 overtone
    playTone(ctx, 523.25, 0.5, 0.2); // C5 undertone
    triggerHaptic([25]);
  },

  // V4: Burst - explosive celebration
  burst: (ctx: AudioContext) => {
    playNoise(ctx, 0.03, 0.4, 3000);
    playTone(ctx, 800, 0.2, 0.4);
    playTone(ctx, 1200, 0.15, 0.3);
    playTone(ctx, 1600, 0.1, 0.2);
    triggerHaptic([20, 10, 40]);
  },

  // V5: Soar - upward sweep
  soar: (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.setValueAtTime(0.4, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    // Add brightness
    playTone(ctx, 800, 0.15, 0.2);
    triggerHaptic([60]);
  },

  // V6: Victory chord - major chord hit
  victory: (ctx: AudioContext) => {
    // C major in higher register
    playTone(ctx, 523.25, 0.4, 0.3); // C5
    playTone(ctx, 659.25, 0.4, 0.28); // E5
    playTone(ctx, 783.99, 0.4, 0.25); // G5
    playTone(ctx, 1046.5, 0.35, 0.2); // C6
    triggerHaptic([40, 20, 40]);
  },
};

// =============================================================================
// HELPERS
// =============================================================================

const playTone = (
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
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
};

const playNoise = (
  ctx: AudioContext,
  duration: number,
  volume: number,
  hpFreq: number
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
  filter.frequency.value = hpFreq;

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
// COMPONENT
// =============================================================================

const DOWN_OPTIONS = [
  { id: "current", name: "Current", desc: "Power chord" },
  { id: "deepImpact", name: "Deep Impact", desc: "Low thud + click" },
  { id: "warning", name: "Warning", desc: "Descending siren" },
  { id: "doubleTap", name: "Double Tap", desc: "Two quick hits" },
  { id: "tension", name: "Tension", desc: "Rising intensity" },
  { id: "punch", name: "Punch", desc: "Short aggressive" },
  { id: "alarm", name: "Alarm", desc: "Attention grab" },
] as const;

const UP_OPTIONS = [
  { id: "current", name: "Current", desc: "Power chord" },
  { id: "triumph", name: "Triumph", desc: "Rising arpeggio" },
  { id: "release", name: "Release", desc: "Satisfying exhale" },
  { id: "ding", name: "Ding", desc: "Clean bell" },
  { id: "burst", name: "Burst", desc: "Explosive" },
  { id: "soar", name: "Soar", desc: "Upward sweep" },
  { id: "victory", name: "Victory", desc: "Major chord" },
] as const;

const LastRepSoundPreview = ({ isOpen, onClose }: LastRepSoundPreviewProps) => {
  if (!isOpen) {
    return null;
  }

  const playDown = (id: string) => {
    const ctx = getAudioContext();
    const fn = lastDownVariations[id as keyof typeof lastDownVariations];
    if (fn) fn(ctx);
  };

  const playUp = (id: string) => {
    const ctx = getAudioContext();
    const fn = lastUpVariations[id as keyof typeof lastUpVariations];
    if (fn) fn(ctx);
  };

  const playCombo = (downId: string, upId: string) => {
    playDown(downId);
    setTimeout(() => playUp(upId), 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-zinc-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/50 p-5">
          <div>
            <h2 className="font-black text-white text-xl uppercase tracking-tight">
              Last Rep Sounds
            </h2>
            <p className="text-sm text-zinc-400">Find what feels right</p>
          </div>
          <button
            className="rounded-full p-2 transition-colors hover:bg-zinc-800"
            onClick={onClose}
            type="button"
          >
            <X className="text-zinc-500" size={24} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* LAST DOWN */}
          <div className="mb-6">
            <h3 className="mb-3 font-bold text-rose-400 text-sm uppercase tracking-wider">
              Last Down <span className="text-zinc-500">— "here it comes"</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DOWN_OPTIONS.map((opt) => (
                <button
                  className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
                    opt.id === "current"
                      ? "border border-zinc-600 bg-zinc-800"
                      : "border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20"
                  }`}
                  key={opt.id}
                  onClick={() => playDown(opt.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      {opt.name}
                    </span>
                    <Play
                      className="text-rose-400"
                      fill="currentColor"
                      size={12}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* LAST UP */}
          <div className="mb-6">
            <h3 className="mb-3 font-bold text-sky-400 text-sm uppercase tracking-wider">
              Last Up <span className="text-zinc-500">— "you did it"</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {UP_OPTIONS.map((opt) => (
                <button
                  className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
                    opt.id === "current"
                      ? "border border-zinc-600 bg-zinc-800"
                      : "border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20"
                  }`}
                  key={opt.id}
                  onClick={() => playUp(opt.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      {opt.name}
                    </span>
                    <Play
                      className="text-sky-400"
                      fill="currentColor"
                      size={12}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* COMBOS */}
          <div className="border-zinc-800 border-t pt-5">
            <h3 className="mb-3 font-bold text-sm text-white uppercase tracking-wider">
              Try Combos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-xl bg-gradient-to-r from-rose-500/20 to-sky-500/20 p-4 font-bold text-sm text-white transition-all hover:from-rose-500/30 hover:to-sky-500/30 active:scale-95"
                onClick={() => playCombo("punch", "triumph")}
                type="button"
              >
                Punch → Triumph
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-rose-500/20 to-sky-500/20 p-4 font-bold text-sm text-white transition-all hover:from-rose-500/30 hover:to-sky-500/30 active:scale-95"
                onClick={() => playCombo("deepImpact", "soar")}
                type="button"
              >
                Deep Impact → Soar
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-rose-500/20 to-sky-500/20 p-4 font-bold text-sm text-white transition-all hover:from-rose-500/30 hover:to-sky-500/30 active:scale-95"
                onClick={() => playCombo("doubleTap", "burst")}
                type="button"
              >
                Double Tap → Burst
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-rose-500/20 to-sky-500/20 p-4 font-bold text-sm text-white transition-all hover:from-rose-500/30 hover:to-sky-500/30 active:scale-95"
                onClick={() => playCombo("tension", "victory")}
                type="button"
              >
                Tension → Victory
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-zinc-800 border-t bg-zinc-900/50 p-5">
          <button
            className="w-full rounded-xl bg-white py-4 font-black text-black uppercase tracking-widest transition-colors hover:bg-zinc-200"
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

export default LastRepSoundPreview;
