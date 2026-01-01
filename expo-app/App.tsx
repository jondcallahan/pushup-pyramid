import "./global.css";
import { useMachine } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BouncingTrophy } from "./components/bouncing-trophy";
import { Icon } from "./components/icon";
import { Onboarding } from "./components/onboarding";
import ShareModal from "./components/share-modal";
import { TimerProgress } from "./components/timer-progress";
import { useAppStore } from "./lib/store";
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

// Main app wrapped in SafeAreaProvider
export default function App() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  // Sync with persisted state (handles hydration)
  useEffect(() => {
    setShowOnboarding(!hasSeenOnboarding);
  }, [hasSeenOnboarding]);

  return (
    <SafeAreaProvider>
      {showOnboarding ? (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      ) : (
        <AppContent />
      )}
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [state, send] = useMachine(workoutMachine);
  const { context } = state;
  const insets = useSafeAreaInsets();

  const showSettings = state.matches({ settings: "open" });
  const openSettings = () => send({ type: "OPEN_SETTINGS" });
  const closeSettings = () => send({ type: "CLOSE_SETTINGS" });
  const [showShareModal, setShowShareModal] = useState(false);

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
  const handleSetTempo = (tempoMs: number) =>
    send({ type: "SET_TEMPO", tempoMs });

  // SVG circle config - match original at 300px
  const size = 300;
  const strokeWidth = 12;

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case "icon":
        return (
          <Icon
            color={strokeColor}
            name="play"
            size={48}
            style={{ marginLeft: 8 }}
          />
        );
      case "countdown":
        return (
          <Text
            className="font-bold text-6xl tabular-nums"
            style={{ color: strokeColor }}
          >
            {countdownSeconds}
          </Text>
        );
      case "rest":
        return (
          <Text
            className="font-mono text-6xl tabular-nums"
            style={{ color: strokeColor }}
          >
            {restSeconds}s
          </Text>
        );
      case "trophy":
        return <BouncingTrophy />;
      case "text":
        return mainContent.text.split("\n").map((line, i) => (
          <Text
            className={`text-center font-black ${
              mainContent.className?.includes("text-7xl")
                ? "text-7xl"
                : mainContent.className?.includes("text-5xl")
                  ? "text-5xl"
                  : "text-6xl"
            }`}
            key={i}
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
    if (stateMeta.subText === "reps")
      return `${context.completedRepsInSet} / ${currentTargetReps} Reps`;
    return stateMeta.subText;
  };

  const tempoOptions = [
    { label: "Fast", ms: 1500 },
    { label: "Normal", ms: 2000 },
    { label: "Slow", ms: 3000 },
  ];

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Settings Modal */}
      <Modal animationType="fade" transparent visible={showSettings}>
        <View className="flex-1 items-center justify-center bg-zinc-950/80 p-6 backdrop-blur-xl">
          <View className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon color="#fff" name="settings" size={20} />
                <Text className="font-bold text-white text-xl">Settings</Text>
              </View>
              <Pressable className="rounded-full p-2" onPress={closeSettings}>
                <Icon color="#fff" name="x" size={24} />
              </Pressable>
            </View>

            {/* Peak Reps */}
            <View className="mb-6">
              <Text className="mb-2 font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                Pyramid Peak
              </Text>
              <View className="flex-row items-center justify-between rounded-xl bg-zinc-950 p-4">
                <Pressable
                  className="rounded-lg bg-zinc-900 p-3 active:bg-zinc-700"
                  onPress={() =>
                    handleSetPeak(Math.max(3, context.peakReps - 1))
                  }
                >
                  <Icon color="#fff" name="chevron-down" size={24} />
                </Pressable>
                <View className="items-center">
                  <Text className="font-bold text-4xl text-white tabular-nums">
                    {context.peakReps}
                  </Text>
                  <Text className="text-xs text-zinc-500">Peak Reps</Text>
                </View>
                <Pressable
                  className="rounded-lg bg-zinc-900 p-3 active:bg-zinc-700"
                  onPress={() =>
                    handleSetPeak(Math.min(20, context.peakReps + 1))
                  }
                >
                  <Icon color="#fff" name="chevron-up" size={24} />
                </Pressable>
              </View>
              <Text className="mt-2 text-center font-medium text-lime-400 text-sm tabular-nums">
                Total Volume: {totalVolume} Push-ups
              </Text>
            </View>

            {/* Tempo */}
            <View className="mb-6">
              <Text className="mb-2 font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                Rep Speed
              </Text>
              <View className="flex-row gap-2">
                {tempoOptions.map((opt) => (
                  <Pressable
                    className={`flex-1 items-center rounded-lg py-3 ${
                      context.tempoMs === opt.ms ? "bg-blue-600" : "bg-zinc-950"
                    }`}
                    key={opt.label}
                    onPress={() => handleSetTempo(opt.ms)}
                  >
                    <Text
                      className={`font-bold ${context.tempoMs === opt.ms ? "text-white" : "text-zinc-400"}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              className="w-full rounded-xl bg-zinc-800 py-4 active:bg-zinc-700"
              onPress={closeSettings}
            >
              <Text className="text-center font-bold text-lg text-white">
                Done
              </Text>
            </Pressable>

            {__DEV__ && (
              <Pressable
                className="mt-4 w-full rounded-xl border border-zinc-700 py-3"
                onPress={() => {
                  useAppStore.setState({ hasSeenOnboarding: false });
                  closeSettings();
                }}
              >
                <Text className="text-center text-sm text-zinc-500">
                  Reset Onboarding (Dev)
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {/* Header - extends to top with safe area padding */}
      <View
        className="flex-row items-center justify-between bg-zinc-900/80 px-4 pb-4 backdrop-blur-md"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center gap-2">
          <View
            className={`h-3 w-3 rounded-full ${status === "working" ? "bg-lime-500" : "bg-slate-500"}`}
          />
          <Text className="font-bold text-white text-xl tracking-wide">
            PYRAMID PUSH
          </Text>
        </View>
        <View className="flex-row gap-4">
          <Pressable
            className="rounded-full p-2"
            disabled={!canSetPeak}
            onPress={openSettings}
            style={{ opacity: canSetPeak ? 1 : 0.5 }}
          >
            <Icon color="#d4d4d8" name="settings" size={20} />
          </Pressable>
          <Pressable className="rounded-full p-2" onPress={handleToggleMute}>
            {context.isMuted ? (
              <Icon color="#d4d4d8" name="volume-off" size={20} />
            ) : (
              <Icon color="#d4d4d8" name="volume-on" size={20} />
            )}
          </Pressable>
          <Pressable className="rounded-full p-2" onPress={handleReset}>
            <Icon color="#fb7185" name="refresh" size={20} />
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 24,
        }}
      >
        {/* Stats Row */}
        <View className="w-full max-w-xl flex-row gap-3">
          <View className="flex-1 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/30 p-3 backdrop-blur-sm">
            <Text className="mb-1 font-bold text-[10px] text-zinc-500 tracking-widest">
              DOING
            </Text>
            <Text className={`font-bold text-3xl ${status !== "resting" ? "text-white" : "text-zinc-500"} tabular-nums`}>
              {currentTargetReps || "-"}
            </Text>
          </View>
          <View className="flex-1 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/30 p-3 backdrop-blur-sm">
            <Text className="mb-1 font-bold text-[10px] text-zinc-500 tracking-widest">
              TOTAL
            </Text>
            <Text className="font-bold text-2xl" numberOfLines={1}>
              <Text className="text-white">{completedVolume}</Text>
              <Text className="text-zinc-500">/{totalVolume}</Text>
            </Text>
          </View>
          <View className="flex-1 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/30 p-3 backdrop-blur-sm">
            <Text className="mb-1 font-bold text-[10px] tracking-widest text-zinc-500">
              UP NEXT
            </Text>
            <Text className={`font-bold text-3xl ${status === "resting" ? "text-white" : "text-zinc-500"} tabular-nums`}>
              {nextSetReps ?? "-"}
            </Text>
          </View>
        </View>

        {/* Circle Button */}
        <Pressable
          className="items-center justify-center"
          onPress={handleMainClick}
          style={{ width: size, height: size }}
        >
          <TimerProgress
            size={size}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            timerStartedAt={context.timerStartedAt}
            timerDuration={context.timerDuration}
            isActive={status === "countdown" || status === "resting"}
          />
          <View className="items-center justify-center">
            {renderMainContent()}
            <Text className="mt-2 font-medium text-xs text-zinc-400 uppercase tracking-widest">
              {getSubText()}
            </Text>
            {status === "finished" && (
              <Text className="mt-2 font-bold text-white text-xl tabular-nums">
                {totalVolume} Reps
              </Text>
            )}
          </View>
        </Pressable>

        {/* Pyramid Bars */}
        <View className="h-16 w-full max-w-xl flex-row items-end justify-between gap-0.5 px-2">
          {context.pyramidSets.map((reps, idx) => {
            const isFinished = status === "finished";
            const isCompleted = isFinished || idx < context.currentSetIndex;
            const isCurrent = !isFinished && idx === context.currentSetIndex;
            const heightPercent = (reps / context.peakReps) * 100;

            return (
              <View
                className={`flex-1 rounded-t ${
                  isCurrent
                    ? "bg-lime-400"
                    : isCompleted
                      ? "bg-lime-600"
                      : "bg-zinc-800"
                }`}
                key={idx}
                style={{
                  height: `${heightPercent}%`,
                  opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.4,
                }}
              />
            );
          })}
        </View>

        {/* Controls */}
        <View className="h-24 w-full items-center justify-center">
          {status === "idle" && (
            <Text className="max-w-xs text-center text-xs text-zinc-500">
              Tap the settings icon to change pyramid height.
            </Text>
          )}

          {(canSkipRest || canPause) && (
            <View className="flex-row gap-4">
              {canSkipRest && (
                <Pressable
                  className="flex-row items-center gap-2 rounded-full bg-zinc-800 px-8 py-4 active:bg-zinc-700"
                  onPress={() => send({ type: "SKIP_REST" })}
                >
                  <Icon color="#fff" name="skip-forward" size={24} />
                  <Text className="font-bold text-lg text-white">
                    Skip Rest
                  </Text>
                </Pressable>
              )}
              {canPause && (
                <Pressable
                  className="flex-row items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-8 py-4 active:bg-zinc-800"
                  onPress={() => send({ type: "PAUSE" })}
                >
                  <Icon color="#d4d4d8" name="pause" size={24} />
                  <Text className="font-bold text-lg text-zinc-300">Pause</Text>
                </Pressable>
              )}
            </View>
          )}

          {canResume && (
            <Pressable
              className="flex-row items-center gap-2 rounded-full bg-amber-500 px-8 py-4 active:bg-amber-600"
              onPress={() => send({ type: "RESUME" })}
            >
              <Icon color="#fff" name="play" size={24} />
              <Text className="font-bold text-lg text-white">Resume</Text>
            </Pressable>
          )}

          {status === "finished" && (
            <View className="flex-row gap-4">
              <Pressable
                className="flex-row items-center gap-2 rounded-full bg-lime-500 px-8 py-4 active:bg-lime-400"
                onPress={() => setShowShareModal(true)}
              >
                <Icon name="share" size={24} color="#09090b" />
                <Text className="font-bold text-lg text-zinc-950">Share</Text>
              </Pressable>
              <Pressable
                className="rounded-full bg-zinc-800 p-4 active:bg-zinc-700"
                onPress={handleReset}
              >
                <Icon color="#fff" name="refresh" size={24} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        peakReps={context.peakReps}
        setsCompleted={context.pyramidSets.length}
        totalVolume={totalVolume}
      />
    </View>
  );
}
