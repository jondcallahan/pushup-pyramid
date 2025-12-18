import { X, Play, Zap, Music } from "lucide-react";

interface AudioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioPreviewModal = ({ isOpen, onClose }: AudioPreviewModalProps) => {

  if (!isOpen) return null;

  const playSound = (type: string) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Helper to play a layered tone that cuts through music on iPhone speakers
    const playLayered = (freqs: number[], volumes: number[], duration: number) => {
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(volumes[i] || 0.1, ctx.currentTime + 0.02);
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
      case "rest": // Zen Bell (C Major Chord)
        const bellFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        playLayered(bellFreqs, [0.15, 0.1, 0.08, 0.05], 1.2);
        break;
      case "finish": // Fanfare
        const playFreq = (f: number, t: number, d: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(f, ctx.currentTime + t);
          g.gain.setValueAtTime(0, ctx.currentTime + t);
          g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
          o.connect(g); g.connect(ctx.destination);
          o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + d);
        };
        playFreq(440, 0, 0.4); playFreq(554.37, 0.1, 0.4); playFreq(659.25, 0.2, 0.4); playFreq(880, 0.3, 0.6);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Phone-Ready Audio</h2>
            <p className="text-sm text-zinc-400">Optimized for iPhone speakers & music</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-800 transition-colors">
            <X size={24} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Down Comparison</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <SoundButton label="Standard Down" onClick={() => playSound("down")} color="bg-zinc-800/30 text-zinc-500 flex-1" />
                <div className="text-zinc-700">→</div>
                <SoundButton label="LAST DOWN: Harmonic" onClick={() => playSound("lastDown")} color="bg-zinc-800 text-rose-400 flex-1 border border-rose-500/20" />
              </div>
              <p className="text-[10px] text-zinc-600 px-1">Adds mid-range harmonics to survive iPhone speaker compression.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Up Comparison</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <SoundButton label="Standard Up" onClick={() => playSound("up")} color="bg-zinc-800/30 text-zinc-500 flex-1" />
                <div className="text-zinc-700">→</div>
                <SoundButton label="LAST UP: Piercing" onClick={() => playSound("lastUp")} color="bg-zinc-800 text-sky-400 flex-1 border border-sky-500/20" />
              </div>
              <p className="text-[10px] text-zinc-600 px-1">High harmonics ensure it cuts through your workout playlist.</p>
            </div>
          </div>

          <div className="pt-4 space-y-3 border-t border-zinc-800">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Atmosphere</h3>
            <div className="grid grid-cols-2 gap-3">
              <SoundButton label="Zen Bell (Rest)" onClick={() => playSound("rest")} color="bg-sky-500/10 text-sky-400" />
              <SoundButton label="Fanfare (Finish)" onClick={() => playSound("finish")} color="bg-lime-500/10 text-lime-400" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
          >
            I Can Hear These!
          </button>
        </div>
      </div>
    </div>
  );
};

const SoundButton = ({ label, onClick, color }: { label: string, onClick: () => void, color: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between w-full p-4 rounded-xl font-bold transition-all active:scale-[0.98] ${color}`}
  >
    <span className="text-xs">{label}</span>
    <Play size={14} fill="currentColor" />
  </button>
);

export default AudioPreviewModal;
