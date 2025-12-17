import { useMachine } from "@xstate/react";
import {
  Activity,
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

  // Glow color mapping based on state
  const glowClassMap: Record<string, string> = {
    idle: "",
    countdown: "drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]",
    working: "drop-shadow-[0_0_15px_rgba(163,230,53,0.5)]",
    "working-last": "drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]",
    resting: "drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]",
    paused: "drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]",
    finished: "drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]",
  };

  const getGlowClass = () => {
    const isLastRep =
      state.hasTag("phase-lastDown") || state.hasTag("phase-lastUp");
    if (status === "working" && isLastRep) {
      return glowClassMap["working-last"];
    }
    return glowClassMap[status] ?? "";
  };

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case "icon":
        return (
          <Play className="ml-2 text-lime-400" fill="currentColor" size={64} />
        );
      case "countdown":
        return (
          <span className="font-bold text-7xl text-sky-400 tracking-tighter">
            {countdownSeconds}
          </span>
        );
      case "rest":
        return (
          <span className="font-bold font-mono text-7xl text-cyan-400">
            {restSeconds}
            <span className="text-2xl text-cyan-700">s</span>
          </span>
        );
      case "trophy":
        return <Trophy className="animate-bounce text-fuchsia-400" size={80} />;
      case "text": {
        const lines = mainContent.text.split("\n");
        const className = mainContent.className || "text-7xl";
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
      return `${context.completedRepsInSet} / ${currentTargetReps} REPS`;
    }
    return stateMeta.subText.toUpperCase();
  };

  // SVG Config
  const size = 320;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Smooth animated progress using requestAnimationFrame
  const [smoothProgress, setSmoothProgress] = useState(1);
  const animationRef = useRef<number | null>(null);

  const { timerStartedAt, timerDuration } = context;

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

    if (!(timerStartedAt && timerDuration)) {
      setSmoothProgress(1);
      return;
    }

    let isActive = true;

    const animate = () => {
      if (!isActive) {
        return;
      }

      const now = Date.now();
      const elapsed = now - timerStartedAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      const progress = remaining / timerDuration;
      setSmoothProgress(progress);

      if (remaining > 0 && isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation immediately
    animate();

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [status, timerStartedAt, timerDuration]);

  const strokeDashoffset = circumference - smoothProgress * circumference;

  return (
    <div className="relative flex min-h-screen touch-manipulation select-none flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      {/* Dynamic Background Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black" />

      {/* Settings Modal (Glassmorphism) */}
      {showSettings === true && (
        <div className="fade-in absolute inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-6 backdrop-blur-sm duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl ring-1 ring-white/5">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-white text-xl">
                <Settings size={20} /> Settings
              </h2>
              <button
                className="rounded-full p-2 transition-colors hover:bg-white/10"
                onClick={() => closeSettings()}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Peak Reps Control */}
              <div>
                <span className="mb-3 block font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                  Pyramid Peak
                </span>
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 p-2">
                  <button
                    className="rounded-xl bg-zinc-800 p-4 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
                    onClick={() =>
                      handleSetPeak(Math.max(3, context.peakReps - 1))
                    }
                    type="button"
                  >
                    <ChevronDown size={24} />
                  </button>
                  <div className="px-4 text-center">
                    <div className="font-bold text-5xl text-white tracking-tight">
                      {context.peakReps}
                    </div>
                    <div className="mt-1 font-medium text-xs text-zinc-500">
                      Peak Reps
                    </div>
                  </div>
                  <button
                    className="rounded-xl bg-zinc-800 p-4 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
                    onClick={() =>
                      handleSetPeak(Math.min(20, context.peakReps + 1))
                    }
                    type="button"
                  >
                    <ChevronUp size={24} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-lime-400/10 py-2 font-medium text-lime-400/90 text-sm">
                  <Activity size={16} /> Total Volume: {totalVolume} Reps
                </div>
              </div>

              {/* Tempo Control */}
              <div>
                <span className="mb-3 block font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                  Rep Speed
                </span>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-black/30 p-1">
                  {[
                    { label: "Fast", ms: 1500 },
                    { label: "Normal", ms: 2000 },
                    { label: "Slow", ms: 3000 },
                  ].map((opt) => (
                    <button
                      className={`rounded-lg py-3 font-bold text-sm transition-all ${
                        context.tempoMs === opt.ms
                          ? "bg-zinc-700 text-white shadow-lg"
                          : "text-zinc-500 hover:text-zinc-300"
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
              className="mt-8 w-full rounded-xl bg-white py-4 font-bold text-black text-lg shadow-lg shadow-white/10 transition-colors hover:bg-zinc-200"
              onClick={() => closeSettings()}
              type="button"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-white/5 border-b bg-black/20 px-6 py-4 backdrop-blur-md">
        <h1 className="flex items-center gap-3 font-bold text-lg text-white tracking-wider">
          <div
            className={`h-2 w-2 rounded-full ${status === "working" ? "bg-lime-500 shadow-[0_0_10px_#84cc16]" : "bg-zinc-600"}`}
          />
          PYRAMID
        </h1>
        <div className="flex gap-2">
          <button
            className="rounded-full p-3 text-zinc-300 transition hover:bg-white/10 disabled:opacity-30"
            disabled={!canSetPeak}
            onClick={() => openSettings()}
            type="button"
          >
            <Settings size={20} />
          </button>
          <button
            className="rounded-full p-3 text-zinc-300 transition hover:bg-white/10"
            onClick={handleToggleMute}
            type="button"
          >
            {context.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            className="rounded-full p-3 text-rose-400 transition hover:bg-white/10"
            onClick={handleReset}
            type="button"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar Top */}
      <div className="h-1 w-full bg-zinc-900/50">
        <div
          className="h-full bg-gradient-to-r from-lime-600 to-lime-400 shadow-[0_0_10px_#84cc16] transition-all duration-500 ease-out"
          style={{
            width: `${status === "finished" ? "100" : String(progressPercent)}%`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="z-0 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-evenly p-6">
        {/* Stats Row - Card Style */}
        <div className="grid w-full grid-cols-3 gap-4">
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
              Total
            </div>
            <div className="font-bold text-3xl text-zinc-300">
              {totalVolume}
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
        <div className="group relative flex items-center justify-center py-4">
          <button
            className="relative flex touch-manipulation items-center justify-center rounded-full outline-none transition-transform active:scale-95"
            onClick={handleMainClick}
            style={{ width: size, height: size }}
            type="button"
          >
            {/* SVG Background Track */}
            <svg
              aria-hidden="true"
              className="-rotate-90 absolute top-0 left-0"
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
                className={`${strokeColorClass} transition-all duration-300 ${getGlowClass()}`}
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
                className={`${strokeColorClass} transition-all duration-200`}
              >
                {renderMainContent()}
              </div>
              <div className="mt-4 font-bold text-sm text-zinc-500 uppercase tracking-widest">
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

        {/* Pyramid Visualization - Refined */}
        <div className="mb-2 flex h-20 w-full items-end justify-between gap-1 px-1">
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === "finished";
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;

            const getBarClassName = () => {
              if (isCurrent) {
                return "z-10 scale-x-110 bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.6)]";
              }
              if (isCompleted) {
                return "bg-lime-900/80";
              }
              return "bg-zinc-800/40";
            };

            return (
              <div
                className={`relative flex-1 overflow-hidden rounded-t-sm transition-all duration-500 ${getBarClassName()}`}
                // biome-ignore lint/suspicious/noArrayIndexKey: pyramid bars are static and idx is the only stable identifier
                key={idx}
                style={{ height: `${Math.max(10, heightPercent)}%` }}
              >
                {/* Shine effect for current bar */}
                {isCurrent ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Bottom Control Area */}
        <div className="flex h-20 w-full items-center justify-center">
          {status === "idle" && (
            <p className="max-w-xs animate-pulse text-center font-medium text-xs text-zinc-500">
              Tap the circle to begin
            </p>
          )}

          {canSkipRest === true && (
            <button
              className="flex items-center gap-2 rounded-full border border-cyan-900/30 bg-zinc-800 px-8 py-4 font-bold text-cyan-400 text-lg shadow-lg transition-all hover:bg-zinc-700 active:scale-95"
              onClick={handleSkipRest}
              type="button"
            >
              <SkipForward size={20} />
              SKIP REST
            </button>
          )}

          {canPause === true && (
            <button
              className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-8 py-4 font-bold text-lg text-zinc-400 shadow-lg transition-colors hover:bg-zinc-800 active:scale-95"
              onClick={handleTogglePause}
              type="button"
            >
              <Pause size={20} />
              PAUSE
            </button>
          )}

          {canResume === true && (
            <button
              className="flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-bold text-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-colors hover:bg-amber-400 active:scale-95"
              onClick={handleTogglePause}
              type="button"
            >
              <Play fill="currentColor" size={20} />
              RESUME
            </button>
          )}

          {status === "finished" && (
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black text-lg shadow-lg transition-colors hover:bg-zinc-200 active:scale-95"
                onClick={() => setShowShareModal(true)}
                type="button"
              >
                <Share2 size={20} />
                SHARE
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-6 py-4 font-bold text-lg text-white shadow-lg transition-colors hover:bg-zinc-700 active:scale-95"
                onClick={handleReset}
                type="button"
              >
                <RefreshCw size={20} />
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
