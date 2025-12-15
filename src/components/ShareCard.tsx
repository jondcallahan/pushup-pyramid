import { forwardRef } from 'react';
import { Trophy, Flame, Mountain, Zap } from 'lucide-react';

interface ShareCardProps {
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
  date: Date;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ totalVolume, peakReps, setsCompleted, date }, ref) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Dynamic motivation based on volume
    const getMotivation = () => {
      if (totalVolume >= 200) return { text: 'BEAST MODE', emoji: '🔥' };
      if (totalVolume >= 100) return { text: 'CRUSHING IT', emoji: '💪' };
      if (totalVolume >= 50) return { text: 'SOLID WORK', emoji: '⚡' };
      return { text: 'EVERY REP COUNTS', emoji: '✨' };
    };

    const motivation = getMotivation();

    return (
      <div
        ref={ref}
        className="w-[390px] h-[520px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
          <div
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15">
          <div
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Geometric accent lines */}
        <div className="absolute top-20 left-0 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute top-24 left-0 w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-xs font-medium tracking-widest uppercase">
                {formattedDate}
              </div>
              <div className="text-slate-500 text-xs mt-0.5">{formattedTime}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 px-3 py-1.5 rounded-full">
              <Flame size={14} className="text-orange-400" />
              <span className="text-white text-xs font-bold tracking-wide">
                PYRAMID PUSH
              </span>
            </div>
          </div>

          {/* Main stat */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            <div className="relative">
              <Trophy className="text-yellow-400 w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
            </div>

            <div className="text-center">
              <div className="text-slate-400 text-sm font-semibold tracking-[0.2em] uppercase mb-2">
                Total Volume
              </div>
              <div className="relative">
                <span
                  className="text-8xl font-black text-white tracking-tight"
                  style={{
                    textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  {totalVolume}
                </span>
                <span className="text-2xl font-bold text-slate-400 ml-2 align-top mt-4 inline-block">
                  reps
                </span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-lg">
                <span className="text-2xl">{motivation.emoji}</span>
                <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                  {motivation.text}
                </span>
                <span className="text-2xl">{motivation.emoji}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <Mountain className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{peakReps}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                Peak Reps
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{setsCompleted}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                Sets Done
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center border border-white/10">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {Math.round(totalVolume * 0.36)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                Cal Est.
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="mt-6 text-center">
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">
              💪 Pyramid Push Workout
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
