import { useMachine } from "@xstate/react";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Share2,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ShareModal from "./components/share-modal";
import {
  selectCompletedVolume,
  selectCountdownSeconds,
  selectCurrentTargetReps,
  selectNextSetReps,
  selectProgressPercent,
  selectRestSeconds,
  selectStateMeta,
  selectTotalVolume,
  workoutMachine,
} from "./workout-machine";

const PushUpPyramid = () => {
  const [state, send] = useMachine(workoutMachine);
  const { context } = state;

  const showSettings = state.matches({ settings: "open" });
  const openSettings = () => send({ type: "OPEN_SETTINGS" });
  const closeSettings = () => send({ type: "CLOSE_SETTINGS" });

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // --- Derived State from Machine ---
  const status = (() => {
    if (state.hasTag("idle")) {
      return "idle";
    }
    if (state.hasTag("countdown")) {
      return "countdown";
    }
    if (state.hasTag("working")) {
      return "working";
    }
    if (state.hasTag("resting")) {
      return "resting";
    }
    if (state.hasTag("paused")) {
      return "paused";
    }
    if (state.hasTag("finished")) {
      return "finished";
    }
    return "idle";
  })();

  const canPause = state.can({ type: "PAUSE" });
  const canResume = state.can({ type: "RESUME" });
  const canSkipRest = state.can({ type: "SKIP_REST" });
  const canSetPeak = state.can({ type: "SET_PEAK", peak: context.peakReps });
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
    if (status === "idle") {
      send({ type: "START" });
    } else if (status === "resting") {
      send({ type: "SKIP_REST" });
    } else if (status === "finished") {
      send({ type: "RESET" });
    } else if (status === "paused") {
      send({ type: "RESUME" });
    } else {
      send({ type: "PAUSE" });
    }
  };

  const handleReset = () => send({ type: "RESET" });
  const handleToggleMute = () => send({ type: "TOGGLE_MUTE" });
  const handleSetPeak = (peak: number) => send({ type: "SET_PEAK", peak });
  const handleSetTempo = (tempoMs: number) =>
    send({ type: "SET_TEMPO", tempoMs });
  const handleTogglePause = () =>
    send({ type: status === "paused" ? "RESUME" : "PAUSE" });
  const handleSkipRest = () => send({ type: "SKIP_REST" });

  // --- UI Helpers ---
  const strokeColorClass = stateMeta.strokeColor;

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case "icon":
        return <Play className="ml-2" size={48} />;
      case "countdown":
        return <span className="font-bold text-6xl">{countdownSeconds}</span>;
      case "rest":
        return <span className="font-mono text-6xl">{restSeconds}s</span>;
      case "trophy":
        return <Trophy className="animate-bounce text-yellow-400" size={64} />;
      case "text": {
        const lines = mainContent.text.split("\n");
        const className = mainContent.className || "text-6xl";
        return (
          <span
            className={`${className} text-center font-black tracking-tighter`}
          >
            {lines.map((line, lineIndex) => (
              <span key={`line-${line}`}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      }
      default:
        return null;
    }
  };

  const getSubText = () => {
    if (stateMeta.subText === "reps") {
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
    if (status !== "countdown" && status !== "resting") {
      setSmoothProgress(1);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const { timerStartedAt, timerDuration } = context;
    if (!(timerStartedAt && timerDuration)) {
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
  }, [status, context]);

  const strokeDashoffset = circumference - smoothProgress * circumference;

  return (
    <div className="relative flex min-h-screen touch-manipulation select-none flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      {/* Settings Modal */}
      {showSettings === true && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-xl">
                <Settings size={20} /> Settings
              </h2>
              <button
                className="rounded-full p-2 hover:bg-zinc-800"
                onClick={() => closeSettings()}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Peak Reps Control */}
              <div>
                <span className="mb-2 block font-semibold text-sm text-zinc-400 uppercase tracking-wider">
                  Pyramid Peak
                </span>
                <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4">
                  <button
                    className="rounded-lg bg-zinc-900 p-3 hover:bg-zinc-800 active:bg-zinc-600"
                    onClick={() =>
                      handleSetPeak(Math.max(3, context.peakReps - 1))
                    }
                    type="button"
                  >
                    <ChevronDown size={24} />
                  </button>
                  <div className="text-center">
                    <div className="font-bold text-4xl text-white">
                      {context.peakReps}
                    </div>
                    <div className="text-xs text-zinc-500">Peak Reps</div>
                  </div>
                  <button
                    className="rounded-lg bg-zinc-900 p-3 hover:bg-zinc-800 active:bg-zinc-600"
                    onClick={() =>
                      handleSetPeak(Math.min(20, context.peakReps + 1))
                    }
                    type="button"
                  >
                    <ChevronUp size={24} />
                  </button>
                </div>
                <div className="mt-2 text-center font-medium text-lime-400 text-sm">
                  Total Volume: {totalVolume} Push-ups
                </div>
              </div>

              {/* Tempo Control */}
              <div>
                <span className="mb-2 block font-semibold text-sm text-zinc-400 uppercase tracking-wider">
                  Rep Speed
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Fast", ms: 1500 },
                    { label: "Normal", ms: 2000 },
                    { label: "Slow", ms: 3000 },
                  ].map((opt) => (
                    <button
                      className={`rounded-lg py-3 font-bold transition-all ${
                        context.tempoMs === opt.ms
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-950 text-zinc-400"
                      }`}
                      key={opt.label}
                      onClick={() => handleSetTempo(opt.ms)}
                      type="button"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="mt-8 w-full rounded-xl bg-zinc-800 py-4 font-bold text-lg transition-colors hover:bg-zinc-700"
              onClick={() => closeSettings()}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="z-10 flex items-center justify-between bg-zinc-900 p-4 shadow-md">
        <h1 className="flex items-center gap-2 font-bold text-xl tracking-wide">
          <div
            className={`h-3 w-3 rounded-full ${status === "working" ? "animate-pulse bg-lime-500" : "bg-zinc-600"}`}
          />
          PYRAMID PUSH
        </h1>
        <div className="flex gap-4">
          <button
            className="rounded-full p-2 text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            disabled={!canSetPeak}
            onClick={() => openSettings()}
            type="button"
          >
            <Settings size={20} />
          </button>
          <button
            className="rounded-full p-2 transition hover:bg-zinc-800"
            onClick={handleToggleMute}
            type="button"
          >
            {context.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            className="rounded-full p-2 text-rose-400 transition hover:bg-zinc-800"
            onClick={handleReset}
            type="button"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-zinc-900">
        <div
          className="h-full bg-lime-500 transition-all duration-500 ease-out"
          style={{
            width: `${status === "finished" ? "100" : String(progressPercent)}%`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 p-6">
        {/* Stats Row - Card Style */}
        <div className="grid w-full grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 p-3 backdrop-blur-sm">
            <div className="mb-1 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
              Set
            </div>
            <div className="font-bold text-3xl text-white">
              {currentTargetReps || "-"}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 p-3 backdrop-blur-sm">
            <div className="mb-1 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
              Volume
            </div>
            <div className="font-bold text-3xl">
              <span className="text-white">{completedVolume}</span>
              <span className="text-zinc-500">/{totalVolume}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 p-3 backdrop-blur-sm">
            <div className="mb-1 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
              Next
            </div>
            <div className="font-bold text-3xl text-zinc-500">
              {nextSetReps ?? "-"}
            </div>
          </div>
        </div>

        {/* Dynamic Circle Button */}
        <div className="group relative my-4 flex items-center justify-center">
          <button
            className="relative flex items-center justify-center rounded-full outline-none transition-transform active:scale-95"
            onClick={handleMainClick}
            style={{ width: size, height: size }}
            type="button"
          >
            {/* SVG Background Track */}
            <svg
              aria-hidden="true"
              className="-rotate-90 absolute top-0 left-0 transform"
              height={size}
              width={size}
            >
              <circle
                className="text-zinc-900"
                cx={size / 2}
                cy={size / 2}
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
              <circle
                className={`${strokeColorClass} transition-colors duration-300`}
                cx={size / 2}
                cy={size / 2}
                fill={status === "idle" ? "transparent" : "#09090b"}
                r={radius}
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            </svg>

            {/* Inner Content */}
            <div className="z-10 flex flex-col items-center justify-center">
              <div
                className={`${strokeColorClass} transition-colors duration-200`}
              >
                {renderMainContent()}
              </div>
              <div className="mt-2 font-medium text-sm text-zinc-400 uppercase tracking-widest opacity-80">
                {getSubText()}
              </div>
              {status === "finished" && (
                <div className="mt-2 font-bold text-white text-xl">
                  {totalVolume} Reps
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Pyramid Visualization */}
        <div className="flex h-16 w-full items-end justify-between gap-0.5 px-2">
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === "finished";
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;

            const getBarClassName = () => {
              if (isCurrent) {
                return "animate-pulse bg-lime-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]";
              }
              if (isCompleted) {
                return "bg-lime-600 opacity-90";
              }
              return "bg-zinc-800 opacity-40";
            };

            return (
              <div
                className={`flex-1 rounded-t-sm transition-all duration-300 ${getBarClassName()}`}
                // biome-ignore lint/suspicious/noArrayIndexKey: pyramid bars are static and idx is the only stable identifier
                key={idx}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>

        {/* Bottom Control Area */}
        <div className="flex h-24 w-full items-center justify-center">
          {status === "idle" && (
            <p className="max-w-xs text-center text-xs text-zinc-500">
              Tap the settings icon <Settings className="inline" size={12} /> to
              change pyramid height.
            </p>
          )}

          {(canSkipRest || canPause) && (
            <div className="flex gap-3">
              {canSkipRest === true && (
                <button
                  className="flex items-center gap-2 rounded-full bg-zinc-800 px-8 py-4 font-bold text-lg text-white shadow-lg transition-colors hover:bg-zinc-700 active:bg-zinc-600"
                  onClick={handleSkipRest}
                  type="button"
                >
                  <SkipForward size={24} />
                  Skip Rest
                </button>
              )}

              {canPause === true && (
                <button
                  className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-8 py-4 font-bold text-lg text-zinc-300 shadow-lg transition-colors hover:bg-zinc-800 active:bg-zinc-800"
                  onClick={handleTogglePause}
                  type="button"
                >
                  <Pause size={24} />
                  Pause
                </button>
              )}
            </div>
          )}

          {canResume === true && (
            <button
              className="flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-bold text-lg text-white shadow-lg transition-colors hover:bg-amber-400 active:scale-95"
              onClick={handleTogglePause}
              type="button"
            >
              <Play size={24} />
              Resume
            </button>
          )}

          {status === "finished" && (
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 rounded-full bg-lime-500 px-8 py-4 font-bold text-lg text-zinc-950 shadow-lg shadow-lime-500/25 transition-all hover:bg-lime-400 active:scale-95"
                onClick={() => setShowShareModal(true)}
                type="button"
              >
                <Share2 size={24} />
                Share
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-4 font-bold text-lg text-white shadow-lg transition-colors hover:bg-zinc-700 active:bg-zinc-600"
                onClick={handleReset}
                type="button"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        peakReps={context.peakReps}
        setsCompleted={context.pyramidSets.length}
        totalVolume={totalVolume}
      />
    </div>
  );
};

export default PushUpPyramid;
