import { useMachine } from '@xstate/react';
import { Play, Pause, SkipForward, RefreshCw, Volume2, VolumeX, Settings, X, ChevronUp, ChevronDown, Trophy } from 'lucide-react';
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
  selectStateMeta,
} from './workoutMachine';

const PushUpPyramid = () => {
  const [state, send] = useMachine(workoutMachine);
  const { context } = state;

  // --- Local UI State (only for modals/settings) ---
  const [showSettings, setShowSettings] = useState(false);

  // --- Derived State from Machine (using tags) ---
  const status = (() => {
    if (state.hasTag('idle')) return 'idle';
    if (state.hasTag('countdown')) return 'countdown';
    if (state.hasTag('working')) return 'working';
    if (state.hasTag('resting')) return 'resting';
    if (state.hasTag('paused')) return 'paused';
    if (state.hasTag('finished')) return 'finished';
    return 'idle';
  })();

  // repPhase no longer needed - meta handles this directly

  // Capability-based flags from tags
  const canPause = state.hasTag('pauseable');
  const canSkip = state.hasTag('skippable');
  const canConfigure = state.hasTag('configurable');

  // UI configuration from state meta
  const stateMeta = selectStateMeta(state);

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

  // --- Meta-driven UI Helpers ---
  const strokeColorClass = stateMeta.strokeColor;

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case 'icon':
        return <Play size={48} className="ml-2" />;
      case 'countdown':
        return <span className="text-6xl font-bold">{countdownSeconds}</span>;
      case 'rest':
        return <span className="text-6xl font-mono">{restSeconds}s</span>;
      case 'trophy':
        return <Trophy size={64} className="text-yellow-400 animate-bounce" />;
      case 'text': {
        const lines = mainContent.text.split('\n');
        const className = mainContent.className || 'text-6xl';
        return (
          <span className={`${className} font-black tracking-tighter text-center`}>
            {lines.map((line, i) => (
              <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
            ))}
          </span>
        );
      }
    }
  };

  const getSubText = () => {
    // For working states, show rep progress instead of static text
    if (stateMeta.subText === 'reps') {
      return `${context.completedRepsInSet} / ${currentTargetReps} Reps`;
    }
    return stateMeta.subText;
  };

  // SVG Config
  const size = 300;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Smooth animated progress using requestAnimationFrame
  const [smoothProgress, setSmoothProgress] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Only animate during countdown or resting
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden touch-manipulation relative">

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings size={20} /> Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-700 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Peak Reps Control */}
              <div>
                <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
                  Pyramid Peak
                </label>
                <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">
                  <button
                    onClick={() => handleSetPeak(Math.max(3, context.peakReps - 1))}
                    className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600"
                  >
                    <ChevronDown size={24} />
                  </button>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{context.peakReps}</div>
                    <div className="text-xs text-slate-500">Peak Reps</div>
                  </div>
                  <button
                    onClick={() => handleSetPeak(Math.min(20, context.peakReps + 1))}
                    className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600"
                  >
                    <ChevronUp size={24} />
                  </button>
                </div>
                <div className="text-center mt-2 text-green-400 font-medium text-sm">
                   Total Volume: {totalVolume} Push-ups
                </div>
              </div>

              {/* Tempo Control */}
              <div>
                <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
                  Rep Speed
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Fast', ms: 1500 },
                      { label: 'Normal', ms: 2000 },
                      { label: 'Slow', ms: 3000 }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleSetTempo(opt.ms)}
                        className={`py-3 rounded-lg font-bold transition-all ${
                          context.tempoMs === opt.ms ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
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
              className="w-full mt-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-slate-800 shadow-md z-10">
        <h1 className="font-bold text-xl tracking-wide flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
          PYRAMID PUSH
        </h1>
        <div className="flex gap-4">
          <button
             onClick={() => setShowSettings(true)}
             className="p-2 hover:bg-slate-700 rounded-full transition text-slate-300"
             disabled={!canConfigure}
          >
            <Settings size={20} />
          </button>
          <button onClick={handleToggleMute} className="p-2 hover:bg-slate-700 rounded-full transition">
            {context.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full transition text-red-400">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2">
        <div
          className="bg-green-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${status === 'finished' ? 100 : progressPercent}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 w-full max-w-xl mx-auto">

        {/* Stats Row */}
        <div className="flex w-full justify-around text-center">
          <div className="min-w-[80px]">
            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Current Set</div>
            <div className="text-4xl font-bold text-white">{currentTargetReps || '-'}</div>
          </div>
          <div className="min-w-[100px]">
            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Volume</div>
            <div className="text-4xl font-bold">
              <span className="text-white">{completedVolume}</span>
              <span className="text-slate-500">/{totalVolume}</span>
            </div>
          </div>
          <div className="min-w-[80px]">
            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Next Up</div>
            <div className="text-4xl font-bold text-slate-500">
              {nextSetReps ?? '-'}
            </div>
          </div>
        </div>

        {/* Dynamic Circle Button */}
        <div className="relative group my-4 flex items-center justify-center">
          <button
            onClick={handleMainClick}
            className="relative flex items-center justify-center rounded-full outline-none transition-transform active:scale-95"
            style={{ width: size, height: size }}
          >
             {/* SVG Background Track */}
             <svg
               className="absolute top-0 left-0 transform -rotate-90"
               width={size}
               height={size}
             >
               <circle
                 stroke="currentColor"
                 className="text-slate-800"
                 strokeWidth={strokeWidth}
                 fill="transparent"
                 r={radius}
                 cx={size / 2}
                 cy={size / 2}
               />
               <circle
                 stroke="currentColor"
                 className={`${strokeColorClass} transition-colors duration-300`}
                 strokeWidth={strokeWidth}
                 fill={status === 'idle' ? 'transparent' : '#1e293b'}
                 r={radius}
                 cx={size / 2}
                 cy={size / 2}
                 strokeDasharray={circumference}
                 strokeDashoffset={strokeDashoffset}
                 strokeLinecap="round"
               />
             </svg>

             {/* Inner Content */}
             <div className="z-10 flex flex-col items-center justify-center">
               <div className={`${strokeColorClass} transition-colors duration-200`}>
                 {renderMainContent()}
               </div>
               <div className="mt-2 text-sm font-medium text-slate-400 opacity-80 uppercase tracking-widest">
                 {getSubText()}
               </div>
               {status === 'finished' && (
                 <div className="mt-2 text-xl font-bold text-white">
                    {totalVolume} Reps
                 </div>
               )}
             </div>
          </button>
        </div>

        {/* Pyramid Visualization */}
        <div className="w-full flex items-end justify-between h-16 gap-0.5 px-2">
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === 'finished';
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;
            return (
              <div
                key={idx}
                className={`
                  flex-1 rounded-t-sm transition-all duration-300
                  ${isCurrent ? 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]' :
                    isCompleted ? 'bg-green-600 opacity-90' : 'bg-slate-700 opacity-40'}
                `}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>

        {/* Bottom Control Area */}
        <div className="h-24 w-full flex items-center justify-center">
            {status === 'idle' && (
              <p className="text-xs text-slate-500 text-center max-w-xs">
                Tap the settings icon <Settings size={12} className="inline"/> to change pyramid height.
              </p>
            )}

            {canSkip && (
              <button
                onClick={handleSkipRest}
                className="flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-full text-white font-bold text-lg transition-colors shadow-lg active:bg-slate-500"
              >
                <SkipForward size={24} />
                Skip Rest
              </button>
            )}

            {canPause && (
              <button
                onClick={handleTogglePause}
                className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 font-bold text-lg transition-colors shadow-lg active:bg-slate-700"
              >
                <Pause size={24} />
                Pause
              </button>
            )}

            {status === 'paused' && (
              <button
                onClick={handleTogglePause}
                className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-full text-white font-bold text-lg transition-colors shadow-lg active:bg-yellow-700"
              >
                <Play size={24} />
                Resume
              </button>
            )}

            {status === 'finished' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-bold text-lg transition-colors shadow-lg active:bg-purple-700"
              >
                <RefreshCw size={24} />
                Restart
              </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default PushUpPyramid;
