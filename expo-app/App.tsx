import "./global.css";
import { useMachine } from "@xstate/react";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RefreshCw,
  Settings,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
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
} from "./lib/workout-machine";

// Color values for SVG strokes (className doesn't work on SVG)
const strokeColors: Record<string, string> = {
  "text-zinc-600": "#52525b",
  "text-lime-400": "#a3e635",
  "text-lime-600": "#65a30d",
  "text-sky-400": "#38bdf8",
  "text-cyan-400": "#22d3ee",
  "text-rose-400": "#fb7185",
  "text-rose-500": "#f43f5e",
  "text-amber-400": "#fbbf24",
  "text-fuchsia-400": "#e879f9",
};

export default function App() {
  const [state, send] = useMachine(workoutMachine);
  const { context } = state;

  const showSettings = state.matches({ settings: "open" });
  const openSettings = () => send({ type: "OPEN_SETTINGS" });
  const closeSettings = () => send({ type: "CLOSE_SETTINGS" });

  // Derived state
  const status = (() => {
    if (state.hasTag("idle")) return "idle";
    if (state.hasTag("countdown")) return "countdown";
    if (state.hasTag("working")) return "working";
    if (state.hasTag("resting")) return "resting";
    if (state.hasTag("paused")) return "paused";
    if (state.hasTag("finished")) return "finished";
    return "idle";
  })();

  const canPause = state.can({ type: "PAUSE" });
  const canResume = state.can({ type: "RESUME" });
  const canSkipRest = state.can({ type: "SKIP_REST" });
  const canSetPeak = state.can({ type: "SET_PEAK", peak: context.peakReps });
  const stateMeta = selectStateMeta(state);
  const strokeColor = strokeColors[stateMeta.strokeColor] || "#52525b";

  const currentTargetReps = selectCurrentTargetReps(context);
  const nextSetReps = selectNextSetReps(context);
  const totalVolume = selectTotalVolume(context);
  const completedVolume = selectCompletedVolume(context);
  const progressPercent = selectProgressPercent(context);
  const countdownSeconds = selectCountdownSeconds(context);
  const restSeconds = selectRestSeconds(context);

  // Event handlers
  const handleMainClick = () => {
    if (status === "idle") send({ type: "START" });
    else if (status === "resting") send({ type: "SKIP_REST" });
    else if (status === "finished") send({ type: "RESET" });
    else if (status === "paused") send({ type: "RESUME" });
    else send({ type: "PAUSE" });
  };

  const handleReset = () => send({ type: "RESET" });
  const handleToggleMute = () => send({ type: "TOGGLE_MUTE" });
  const handleSetPeak = (peak: number) => send({ type: "SET_PEAK", peak });
  const handleSetTempo = (tempoMs: number) => send({ type: "SET_TEMPO", tempoMs });

  // SVG circle config - match original at 300px
  const size = 300;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Smooth progress animation
  const [smoothProgress, setSmoothProgress] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "countdown" && status !== "resting") {
      setSmoothProgress(1);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
      setSmoothProgress(remaining / timerDuration);
      if (remaining > 0) animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status, context]);

  const strokeDashoffset = circumference - smoothProgress * circumference;

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case "icon":
        return <Play size={48} color={strokeColor} style={{ marginLeft: 8 }} />;
      case "countdown":
        return (
          <Text className="text-6xl font-bold tabular-nums" style={{ color: strokeColor }}>
            {countdownSeconds}
          </Text>
        );
      case "rest":
        return (
          <Text className="text-6xl font-mono tabular-nums" style={{ color: strokeColor }}>
            {restSeconds}s
          </Text>
        );
      case "trophy":
        return <Trophy size={64} color="#facc15" />;
      case "text":
        return mainContent.text.split("\n").map((line, i) => (
          <Text
            key={i}
            className={`font-black text-center ${
              mainContent.className?.includes("text-7xl") ? "text-7xl" : 
              mainContent.className?.includes("text-5xl") ? "text-5xl" : "text-6xl"
            }`}
            style={{ color: strokeColor, letterSpacing: -2 }}
          >
            {line}
          </Text>
        ));
      default:
        return null;
    }
  };

  const getSubText = () => {
    if (stateMeta.subText === "reps") return `${context.completedRepsInSet} / ${currentTargetReps} Reps`;
    return stateMeta.subText;
  };

  const tempoOptions = [
    { label: "Fast", ms: 1500 },
    { label: "Normal", ms: 2000 },
    { label: "Slow", ms: 3000 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-zinc-950/95 p-6">
          <View className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-2">
                <Settings size={20} color="#fff" />
                <Text className="text-xl font-bold text-white">Settings</Text>
              </View>
              <Pressable className="p-2 rounded-full" onPress={closeSettings}>
                <X size={24} color="#fff" />
              </Pressable>
            </View>

            {/* Peak Reps */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Pyramid Peak
              </Text>
              <View className="flex-row items-center justify-between bg-zinc-950 rounded-xl p-4">
                <Pressable 
                  className="p-3 bg-zinc-900 rounded-lg active:bg-zinc-700"
                  onPress={() => handleSetPeak(Math.max(3, context.peakReps - 1))}
                >
                  <ChevronDown size={24} color="#fff" />
                </Pressable>
                <View className="items-center">
                  <Text className="text-4xl font-bold text-white tabular-nums">{context.peakReps}</Text>
                  <Text className="text-xs text-zinc-500">Peak Reps</Text>
                </View>
                <Pressable 
                  className="p-3 bg-zinc-900 rounded-lg active:bg-zinc-700"
                  onPress={() => handleSetPeak(Math.min(20, context.peakReps + 1))}
                >
                  <ChevronUp size={24} color="#fff" />
                </Pressable>
              </View>
              <Text className="text-center text-sm font-medium text-lime-400 mt-2 tabular-nums">
                Total Volume: {totalVolume} Push-ups
              </Text>
            </View>

            {/* Tempo */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Rep Speed
              </Text>
              <View className="flex-row gap-2">
                {tempoOptions.map((opt) => (
                  <Pressable
                    key={opt.label}
                    className={`flex-1 py-3 items-center rounded-lg ${
                      context.tempoMs === opt.ms ? "bg-blue-600" : "bg-zinc-950"
                    }`}
                    onPress={() => handleSetTempo(opt.ms)}
                  >
                    <Text className={`font-bold ${context.tempoMs === opt.ms ? "text-white" : "text-zinc-400"}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable className="w-full py-4 bg-zinc-800 rounded-xl active:bg-zinc-700" onPress={closeSettings}>
              <Text className="text-lg font-bold text-white text-center">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-zinc-900">
        <View className="flex-row items-center gap-2">
          <View className={`w-3 h-3 rounded-full ${status === "working" ? "bg-lime-500" : "bg-slate-500"}`} />
          <Text className="text-xl font-bold text-white tracking-wide">PYRAMID PUSH</Text>
        </View>
        <View className="flex-row gap-4">
          <Pressable 
            className="p-2 rounded-full" 
            disabled={!canSetPeak}
            onPress={openSettings}
            style={{ opacity: canSetPeak ? 1 : 0.5 }}
          >
            <Settings size={20} color="#d4d4d8" />
          </Pressable>
          <Pressable className="p-2 rounded-full" onPress={handleToggleMute}>
            {context.isMuted ? <VolumeX size={20} color="#d4d4d8" /> : <Volume2 size={20} color="#d4d4d8" />}
          </Pressable>
          <Pressable className="p-2 rounded-full" onPress={handleReset}>
            <RefreshCw size={20} color="#fb7185" />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-zinc-900">
        <View 
          className="h-full bg-lime-500" 
          style={{ width: `${status === "finished" ? 100 : progressPercent}%` }} 
        />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 24 }}>
        {/* Stats Row */}
        <View className="flex-row w-full max-w-xl gap-3">
          <View className="flex-1 items-center justify-center p-3 rounded-2xl bg-zinc-900/50 border border-white/5">
            <Text className="text-[10px] font-bold text-zinc-500 tracking-widest mb-1">SET</Text>
            <Text className="text-3xl font-bold font-display text-white tabular-nums">{currentTargetReps || "-"}</Text>
          </View>
          <View className="flex-1 items-center justify-center p-3 rounded-2xl bg-zinc-900/50 border border-white/5">
            <Text className="text-[10px] font-bold text-zinc-500 tracking-widest mb-1">VOLUME</Text>
            <Text className="text-3xl font-bold font-display tabular-nums">
              <Text className="text-white">{completedVolume}</Text>
              <Text className="text-zinc-500">/{totalVolume}</Text>
            </Text>
          </View>
          <View className="flex-1 items-center justify-center p-3 rounded-2xl bg-zinc-900/50 border border-white/5">
            <Text className="text-[10px] font-bold text-zinc-500 tracking-widest mb-1">NEXT</Text>
            <Text className="text-3xl font-bold font-display text-zinc-500 tabular-nums">{nextSetReps ?? "-"}</Text>
          </View>
        </View>

        {/* Circle Button */}
        <Pressable 
          className="items-center justify-center" 
          onPress={handleMainClick}
          style={{ width: size, height: size }}
        >
          <Svg 
            width={size} 
            height={size} 
            style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
          >
            <Circle 
              cx={size / 2} 
              cy={size / 2} 
              r={radius} 
              stroke="#18181b" 
              strokeWidth={strokeWidth} 
              fill="transparent" 
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill={status === "idle" ? "transparent" : "#09090b"}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View className="items-center justify-center">
            {renderMainContent()}
            <Text className="text-xs font-medium text-zinc-400 uppercase tracking-widest mt-2">
              {getSubText()}
            </Text>
            {status === "finished" && (
              <Text className="text-xl font-bold text-white mt-2 tabular-nums">{totalVolume} Reps</Text>
            )}
          </View>
        </Pressable>

        {/* Pyramid Bars */}
        <View className="flex-row items-end justify-between w-full max-w-xl h-16 px-2 gap-0.5">
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === "finished";
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;

            return (
              <View
                key={idx}
                className={`flex-1 rounded-t ${
                  isCurrent ? "bg-lime-400" : isCompleted ? "bg-lime-600" : "bg-zinc-800"
                }`}
                style={{ 
                  height: `${heightPercent}%`,
                  opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.4,
                }}
              />
            );
          })}
        </View>

        {/* Controls */}
        <View className="h-24 items-center justify-center w-full">
          {status === "idle" && (
            <Text className="text-xs text-zinc-500 text-center max-w-xs">
              Tap the settings icon to change pyramid height.
            </Text>
          )}

          {(canSkipRest || canPause) && (
            <View className="flex-row gap-4">
              {canSkipRest && (
                <Pressable 
                  className="flex-row items-center gap-2 bg-zinc-800 py-4 px-8 rounded-full active:bg-zinc-700"
                  onPress={() => send({ type: "SKIP_REST" })}
                >
                  <SkipForward size={24} color="#fff" />
                  <Text className="text-lg font-bold text-white">Skip Rest</Text>
                </Pressable>
              )}
              {canPause && (
                <Pressable 
                  className="flex-row items-center gap-2 bg-zinc-900 border border-zinc-700 py-4 px-8 rounded-full active:bg-zinc-800"
                  onPress={() => send({ type: "PAUSE" })}
                >
                  <Pause size={24} color="#d4d4d8" />
                  <Text className="text-lg font-bold text-zinc-300">Pause</Text>
                </Pressable>
              )}
            </View>
          )}

          {canResume && (
            <Pressable 
              className="flex-row items-center gap-2 bg-amber-500 py-4 px-8 rounded-full active:bg-amber-600"
              onPress={() => send({ type: "RESUME" })}
            >
              <Play size={24} color="#fff" />
              <Text className="text-lg font-bold text-white">Resume</Text>
            </Pressable>
          )}

          {status === "finished" && (
            <View className="flex-row gap-4">
              <Pressable className="flex-row items-center gap-2 bg-purple-600 py-4 px-8 rounded-full active:bg-purple-700">
                <Text className="text-lg font-bold text-white">🎉 Share</Text>
              </Pressable>
              <Pressable 
                className="p-4 bg-zinc-800 rounded-full active:bg-zinc-700"
                onPress={handleReset}
              >
                <RefreshCw size={24} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
