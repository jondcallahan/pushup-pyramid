import { Play, X } from "lucide-react";

type AudioPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AudioPreviewModal = ({ isOpen, onClose }: AudioPreviewModalProps) => {
  if (!isOpen) {
    return null;
  }

  const playSound = (type: string) => {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();

    // Helper to play a layered tone that cuts through music on iPhone speakers
    const playLayered = (
      freqs: number[],
      volumes: number[],
      duration: number
    ) => {
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(
          volumes[i] || 0.1,
          ctx.currentTime + 0.02
        );
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + duration + 0.1);
      });
    };

    switch (type) {
      case "down": // Standard Down (150Hz) - harder on small speakers
        playLayered([150, 300], [0.4, 0.1], 0.1); // Added octave 300Hz for iPhone audibility
        break;
      case "up": // Standard Up (800Hz) - very clear
        playLayered([800], [0.3], 0.08);
        break;
      case "lastDown": // Reminiscent of 150Hz but "Deeper/Resonant"
        // 150Hz base + 225Hz (Perfect 5th) + 300Hz (Octave)
        // Layering 225/300 ensures it is audible even if the 150Hz sub is lost
        playLayered([150, 225, 300], [0.4, 0.2, 0.1], 0.2);
        break;
      case "lastUp": // Reminiscent of 800Hz but "Brighter"
        // 800Hz base + 1600Hz (Octave) + 2400Hz (12th)
        // High frequencies cut through music like a knife
        playLayered([800, 1600, 2400], [0.3, 0.15, 0.1], 0.15);
        break;
      case "rest": {
        // Zen Bell (C Major Chord)
        const bellFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        playLayered(bellFreqs, [0.15, 0.1, 0.08, 0.05], 1.2);
        break;
      }
      case "finish": {
        // Fanfare
        const playFreq = (f: number, t: number, d: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(f, ctx.currentTime + t);
          g.gain.setValueAtTime(0, ctx.currentTime + t);
          g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + t);
          o.stop(ctx.currentTime + t + d);
        };
        playFreq(440, 0, 0.4);
        playFreq(554.37, 0.1, 0.4);
        playFreq(659.25, 0.2, 0.4);
        playFreq(880, 0.3, 0.6);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/50 p-6">
          <div>
            <h2 className="font-black text-2xl text-white uppercase italic tracking-tight">
              Phone-Ready Audio
            </h2>
            <p className="text-sm text-zinc-400">
              Optimized for iPhone speakers & music
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

        <div className="space-y-8 p-6">
          <div className="space-y-4">
            <h3 className="font-bold text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
              Down Comparison
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <SoundButton
                  color="bg-zinc-800/30 text-zinc-500 flex-1"
                  label="Standard Down"
                  onClick={() => playSound("down")}
                />
                <div className="text-zinc-700">→</div>
                <SoundButton
                  color="bg-zinc-800 text-rose-400 flex-1 border border-rose-500/20"
                  label="LAST DOWN: Harmonic"
                  onClick={() => playSound("lastDown")}
                />
              </div>
              <p className="px-1 text-[10px] text-zinc-600">
                Adds mid-range harmonics to survive iPhone speaker compression.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
              Up Comparison
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <SoundButton
                  color="bg-zinc-800/30 text-zinc-500 flex-1"
                  label="Standard Up"
                  onClick={() => playSound("up")}
                />
                <div className="text-zinc-700">→</div>
                <SoundButton
                  color="bg-zinc-800 text-sky-400 flex-1 border border-sky-500/20"
                  label="LAST UP: Piercing"
                  onClick={() => playSound("lastUp")}
                />
              </div>
              <p className="px-1 text-[10px] text-zinc-600">
                High harmonics ensure it cuts through your workout playlist.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-zinc-800 border-t pt-4">
            <h3 className="font-bold text-[10px] text-white uppercase tracking-[0.2em]">
              Atmosphere
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <SoundButton
                color="bg-sky-500/10 text-sky-400"
                label="Zen Bell (Rest)"
                onClick={() => playSound("rest")}
              />
              <SoundButton
                color="bg-lime-500/10 text-lime-400"
                label="Fanfare (Finish)"
                onClick={() => playSound("finish")}
              />
            </div>
          </div>
        </div>

        <div className="border-zinc-800 border-t bg-zinc-900/50 p-6">
          <button
            className="w-full rounded-xl bg-white py-4 font-black text-black uppercase tracking-widest shadow-lg shadow-white/5 transition-colors hover:bg-zinc-200"
            onClick={onClose}
            type="button"
          >
            I Can Hear These!
          </button>
        </div>
      </div>
    </div>
  );
};

const SoundButton = ({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: string;
}) => (
  <button
    className={`flex w-full items-center justify-between rounded-xl p-4 font-bold transition-all active:scale-[0.98] ${color}`}
    onClick={onClick}
    type="button"
  >
    <span className="text-xs">{label}</span>
    <Play fill="currentColor" size={14} />
  </button>
);

export default AudioPreviewModal;
