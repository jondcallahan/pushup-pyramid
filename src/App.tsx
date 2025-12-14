import { useMachine } from '@xstate/react';
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Settings, X, ChevronUp, ChevronDown, Trophy, Flame } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  workoutMachine,
  selectCurrentTargetReps,
  selectNextSetReps,
  selectTotalVolume,
  selectCompletedVolume,
  selectProgressPercent,
  selectCountdownSeconds,
  selectRestSeconds,
} from './workoutMachine';

const PushUpPyramid = () => {
  const [state, send] = useMachine(workoutMachine);
  const { context } = state;

  // --- Local UI State (only for modals/settings) ---
  const [showSettings, setShowSettings] = useState(false);

  // --- Derived State from Machine ---
  const status = (() => {
    if (state.matches('idle')) return 'idle';
    if (state.matches({ active: 'countdown' })) return 'countdown';
    if (state.matches({ active: 'working' })) return 'working';
    if (state.matches({ active: 'resting' })) return 'resting';
    if (state.matches('paused')) return 'paused';
    if (state.matches('finished')) return 'finished';
    return 'idle';
  })();

  const repPhase = (() => {
    if (state.matches({ active: { working: 'start' } })) return 'start';
    if (state.matches({ active: { working: 'down' } })) return 'down';
    if (state.matches({ active: { working: 'up' } })) return 'up';
    if (state.matches({ active: { working: 'lastDown' } })) return 'lastDown';
    if (state.matches({ active: { working: 'lastUp' } })) return 'lastUp';
    return 'start';
  })();

  // All data comes from machine context
  const currentTargetReps = selectCurrentTargetReps(context);
  const nextSetReps = selectNextSetReps(context);
  const totalVolume = selectTotalVolume(context);
  const completedVolume = selectCompletedVolume(context);
  const progressPercent = selectProgressPercent(context);
  const countdownSeconds = selectCountdownSeconds(context);
  const restSeconds = selectRestSeconds(context);

  // --- Event Handlers (just send events to machine) ---
  const handleMainClick = () => {
    if (status === 'idle') {
      send({ type: 'START' });
    } else if (status === 'resting') {
      send({ type: 'SKIP_REST' });
    } else if (status === 'finished') {
      send({ type: 'RESET' });
    } else if (status === 'paused') {
      send({ type: 'RESUME' });
    } else {
      send({ type: 'PAUSE' });
    }
  };

  const handleReset = () => send({ type: 'RESET' });
  const handleToggleMute = () => send({ type: 'TOGGLE_MUTE' });
  const handleSetPeak = (peak: number) => send({ type: 'SET_PEAK', peak });
  const handleSetTempo = (tempoMs: number) => send({ type: 'SET_TEMPO', tempoMs });
  const handleTogglePause = () => send({ type: status === 'paused' ? 'RESUME' : 'PAUSE' });
  const handleSkipRest = () => send({ type: 'SKIP_REST' });

  // --- Ring color based on state ---
  const getRingColor = () => {
    if (status === 'paused') return '#eab308'; // yellow
    if (status === 'resting') return '#3b82f6'; // blue
    if (status === 'countdown') return '#f48c06'; // flame
    if (status === 'working') {
      if (repPhase === 'lastDown' || repPhase === 'lastUp') return '#e85d04'; // ember
      return '#22c55e'; // green
    }
    if (status === 'finished') return '#a855f7'; // purple
    return '#4a4642'; // stone
  };

  const getMainText = () => {
    if (status === 'idle') return (
      <div className="flex flex-col items-center animate-float">
        <Play size={56} strokeWidth={2.5} className="text-[var(--color-ember)]" />
        <span className="font-display text-2xl text-[var(--color-dust)] mt-2">START</span>
      </div>
    );
    if (status === 'countdown') return (
      <span className="font-display text-[120px] leading-none text-[var(--color-flame)] animate-count" key={countdownSeconds}>
        {countdownSeconds}
      </span>
    );
    if (status === 'working') {
      const isLast = repPhase === 'lastDown' || repPhase === 'lastUp';
      const direction = repPhase.includes('down') ? 'DOWN' : (repPhase.includes('up') ? 'UP' : 'GO');
      return (
        <div className="flex flex-col items-center">
          {isLast && <span className="font-display text-xl text-[var(--color-ember)] tracking-widest">LAST</span>}
          <span className={`font-display leading-none ${isLast ? 'text-7xl text-[var(--color-ember)]' : 'text-8xl text-[var(--color-work)]'}`}>
            {direction}
          </span>
        </div>
      );
    }
    if (status === 'resting') return (
      <div className="flex flex-col items-center">
        <span className="font-mono text-7xl font-bold text-[var(--color-rest)]">{restSeconds}</span>
        <span className="font-display text-xl text-[var(--color-dust)] tracking-widest">REST</span>
      </div>
    );
    if (status === 'paused') return (
      <div className="flex flex-col items-center">
        <Pause size={48} className="text-yellow-500" />
        <span className="font-display text-3xl text-yellow-500 mt-2">PAUSED</span>
      </div>
    );
    if (status === 'finished') return (
      <div className="flex flex-col items-center">
        <Trophy size={64} className="text-[var(--color-gold)] animate-trophy" />
        <span className="font-display text-3xl text-[var(--color-victory)] mt-2">COMPLETE</span>
        <span className="font-mono text-2xl text-[var(--color-gold)] font-bold">{totalVolume} REPS</span>
      </div>
    );
  };

  const getSubText = () => {
    if (status === 'idle') return null;
    if (status === 'countdown') return <span className="text-[var(--color-dust)]">GET READY</span>;
    if (status === 'working') return (
      <span className="text-[var(--color-dust)]">
        <span className="text-white font-bold">{context.completedRepsInSet}</span>
        <span className="mx-1">/</span>
        <span>{currentTargetReps}</span>
      </span>
    );
    if (status === 'resting') return <span className="text-[var(--color-rest)]">TAP TO SKIP</span>;
    if (status === 'paused') return <span className="text-yellow-500/70">TAP TO RESUME</span>;
    return null;
  };

  // SVG Config
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Smooth animated progress using requestAnimationFrame
  const [smoothProgress, setSmoothProgress] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'countdown' && status !== 'resting') {
      setSmoothProgress(1);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const { timerStartedAt, timerDuration } = context;
    if (!timerStartedAt || !timerDuration) {
      setSmoothProgress(1);
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - timerStartedAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      const progress = remaining / timerDuration;
      setSmoothProgress(progress);

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status, context.timerStartedAt, context.timerDuration]);

  const strokeDashoffset = circumference - (smoothProgress * circumference);

  return (
    <div className="min-h-screen text-white flex flex-col font-mono select-none overflow-hidden touch-manipulation relative">

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-[var(--color-void)]/95 backdrop-blur-sm flex items-center justify-center p-6 animate-slide-up">
          <div className="card-concrete w-full max-w-sm rounded-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-3xl text-[var(--color-ember)] flex items-center gap-3">
                <Settings size={24} />
                CONFIG
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-[var(--color-stone)] rounded transition text-[var(--color-dust)]">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Peak Reps Control */}
              <div>
                <label className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-widest mb-3 block">
                  Pyramid Peak
                </label>
                <div className="flex items-center justify-between bg-[var(--color-void)] rounded-lg p-4 border border-[var(--color-stone)]">
                  <button
                    onClick={() => handleSetPeak(Math.max(3, context.peakReps - 1))}
                    className="p-3 bg-[var(--color-concrete)] rounded hover:bg-[var(--color-stone)] active:scale-95 transition btn-press"
                  >
                    <ChevronDown size={24} className="text-[var(--color-ember)]" />
                  </button>
                  <div className="text-center">
                    <div className="font-display text-6xl text-[var(--color-flame)]">{context.peakReps}</div>
                    <div className="text-xs text-[var(--color-dust)] tracking-widest">PEAK</div>
                  </div>
                  <button
                    onClick={() => handleSetPeak(Math.min(20, context.peakReps + 1))}
                    className="p-3 bg-[var(--color-concrete)] rounded hover:bg-[var(--color-stone)] active:scale-95 transition btn-press"
                  >
                    <ChevronUp size={24} className="text-[var(--color-ember)]" />
                  </button>
                </div>
                <div className="text-center mt-3 text-[var(--color-work)] font-bold text-sm font-mono">
                  ★ {totalVolume} TOTAL REPS ★
                </div>
              </div>

              {/* Tempo Control */}
              <div>
                <label className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-widest mb-3 block">
                  Rep Speed
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'FAST', ms: 1500 },
                    { label: 'NORMAL', ms: 2000 },
                    { label: 'SLOW', ms: 3000 }
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSetTempo(opt.ms)}
                      className={`py-3 rounded font-display text-lg tracking-wider transition btn-press ${context.tempoMs === opt.ms
                          ? 'bg-[var(--color-ember)] text-white ring-ember'
                          : 'bg-[var(--color-void)] text-[var(--color-dust)] border border-[var(--color-stone)] hover:border-[var(--color-ember)]'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-8 py-4 bg-[var(--color-ember)] hover:bg-[var(--color-flame)] rounded font-display text-2xl tracking-wider transition btn-press"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* Header - Industrial style */}
      <header className="p-4 flex justify-between items-center bg-[var(--color-charcoal)] border-b-2 border-[var(--color-ember)] z-10">
        <div className="flex items-center gap-3">
          <Flame
            size={24}
            className={`${status === 'working' ? 'text-[var(--color-ember)] animate-glow' : 'text-[var(--color-stone)]'}`}
          />
          <h1 className="font-display text-2xl tracking-widest text-white">
            PYRAMID<span className="text-[var(--color-ember)]">PUSH</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 hover:bg-[var(--color-concrete)] rounded transition text-[var(--color-dust)] hover:text-[var(--color-ember)]"
            disabled={status === 'working' || status === 'resting'}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleToggleMute}
            className="p-2.5 hover:bg-[var(--color-concrete)] rounded transition text-[var(--color-dust)] hover:text-white"
          >
            {context.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 hover:bg-[var(--color-concrete)] rounded transition text-[var(--color-danger)] hover:text-red-400"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Progress Bar - Glowing effect */}
      <div className="w-full bg-[var(--color-void)] h-1.5 relative overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-[var(--color-ember)] to-[var(--color-gold)]"
          style={{
            width: `${status === 'finished' ? 100 : progressPercent}%`,
            boxShadow: '0 0 10px var(--color-ember)'
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4 w-full max-w-xl mx-auto">

        {/* Stats Row */}
        <div
          className="flex w-full justify-around text-center animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="min-w-[80px]">
            <div className="text-[var(--color-dust)] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">SET</div>
            <div className="font-display text-5xl text-white">{currentTargetReps || '—'}</div>
          </div>
          <div className="min-w-[100px]">
            <div className="text-[var(--color-dust)] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">VOLUME</div>
            <div className="font-mono text-3xl font-bold">
              <span className="text-[var(--color-gold)]">{completedVolume}</span>
              <span className="text-[var(--color-stone)] mx-0.5">/</span>
              <span className="text-[var(--color-dust)]">{totalVolume}</span>
            </div>
          </div>
          <div className="min-w-[80px]">
            <div className="text-[var(--color-dust)] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">NEXT</div>
            <div className="font-display text-5xl text-[var(--color-stone)]">{nextSetReps ?? '—'}</div>
          </div>
        </div>

        {/* Dynamic Circle Button */}
        <div
          className="relative my-2 flex items-center justify-center animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <button
            onClick={handleMainClick}
            className="relative flex items-center justify-center rounded-full outline-none transition-transform active:scale-95 btn-press"
            style={{ width: size, height: size }}
          >
            {/* SVG Ring */}
            <svg
              className="absolute top-0 left-0 transform -rotate-90"
              width={size}
              height={size}
            >
              {/* Background track */}
              <circle
                stroke="var(--color-concrete)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              {/* Progress ring */}
              <circle
                stroke={getRingColor()}
                strokeWidth={strokeWidth}
                fill="var(--color-charcoal)"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke 0.3s ease',
                  filter: status === 'working' || status === 'countdown' ? `drop-shadow(0 0 8px ${getRingColor()})` : 'none'
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="z-10 flex flex-col items-center justify-center">
              {getMainText()}
              {getSubText() && (
                <div className="mt-3 text-xs font-bold uppercase tracking-[0.2em]">
                  {getSubText()}
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Pyramid Visualization */}
        <div
          className="w-full flex items-end justify-center h-16 gap-1 px-4 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === 'finished';
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;
            return (
              <div
                key={idx}
                className={`
                  w-3 rounded-t-sm transition-all duration-300 animate-bar
                  ${isCurrent
                    ? 'bg-[var(--color-ember)] ring-ember'
                    : isCompleted
                      ? 'bg-[var(--color-work)]'
                      : 'bg-[var(--color-stone)]'
                  }
                `}
                style={{
                  height: `${heightPercent}%`,
                  animationDelay: `${idx * 0.05}s`,
                  opacity: isCompleted || isCurrent ? 1 : 0.4
                }}
              />
            );
          })}
        </div>

        {/* Bottom Control Area */}
        <div
          className="h-20 w-full flex items-center justify-center animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          {status === 'idle' && (
            <p className="text-xs text-[var(--color-dust)] text-center max-w-xs tracking-wide">
              TAP <Settings size={12} className="inline text-[var(--color-ember)]" /> TO CONFIGURE YOUR PYRAMID
            </p>
          )}

          {status === 'resting' && (
            <button
              onClick={handleSkipRest}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--color-rest)] hover:bg-blue-500 rounded font-display text-xl tracking-wider text-white transition btn-press shadow-lg"
              style={{ boxShadow: '0 0 20px var(--color-rest-glow)' }}
            >
              <SkipForward size={24} />
              SKIP REST
            </button>
          )}

          {(status === 'working' || status === 'countdown') && (
            <button
              onClick={handleTogglePause}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--color-concrete)] hover:bg-[var(--color-stone)] border border-[var(--color-stone)] rounded font-display text-xl tracking-wider text-[var(--color-dust)] transition btn-press"
            >
              <Pause size={24} />
              PAUSE
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={handleTogglePause}
              className="flex items-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 rounded font-display text-xl tracking-wider text-black transition btn-press shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)' }}
            >
              <Play size={24} />
              RESUME
            </button>
          )}

          {status === 'finished' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-3 px-8 py-4 bg-[var(--color-victory)] hover:bg-purple-400 rounded font-display text-xl tracking-wider text-white transition btn-press shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
            >
              <RotateCcw size={24} />
              GO AGAIN
            </button>
          )}
        </div>

      </main>
    </div>
  );
};

export default PushUpPyramid;
