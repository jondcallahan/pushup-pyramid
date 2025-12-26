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
  StyleSheet,
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

// Colors from Tailwind
const colors = {
  zinc950: "#09090b",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  white: "#ffffff",
  lime400: "#a3e635",
  lime500: "#84cc16",
  lime600: "#65a30d",
  sky400: "#38bdf8",
  cyan400: "#22d3ee",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  rose400: "#fb7185",
  rose500: "#f43f5e",
  fuchsia400: "#e879f9",
  purple600: "#9333ea",
  blue600: "#2563eb",
  yellow400: "#facc15",
  slate500: "#64748b",
};

// Map stroke color class to color
const strokeColorMap: Record<string, string> = {
  "text-zinc-600": colors.zinc600,
  "text-lime-400": colors.lime400,
  "text-lime-600": colors.lime600,
  "text-sky-400": colors.sky400,
  "text-cyan-400": colors.cyan400,
  "text-rose-400": colors.rose400,
  "text-rose-500": colors.rose500,
  "text-amber-400": colors.amber400,
  "text-fuchsia-400": colors.fuchsia400,
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

  // SVG circle config
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
  const strokeColor = strokeColorMap[stateMeta.strokeColor] || colors.zinc600;

  const renderMainContent = () => {
    const { mainContent } = stateMeta;
    switch (mainContent.type) {
      case "icon":
        return <Play size={48} color={strokeColor} style={{ marginLeft: 8 }} />;
      case "countdown":
        return (
          <Text style={[styles.mainText, styles.tabularNums, { color: strokeColor, fontSize: 64 }]}>
            {countdownSeconds}
          </Text>
        );
      case "rest":
        return (
          <Text style={[styles.mainText, styles.tabularNums, { color: strokeColor, fontSize: 64 }]}>
            {restSeconds}s
          </Text>
        );
      case "trophy":
        return <Trophy size={64} color={colors.yellow400} />;
      case "text":
        return mainContent.text.split("\n").map((line, i) => (
          <Text
            key={i}
            style={[styles.mainText, {
              color: strokeColor,
              fontSize: mainContent.className?.includes("text-7xl") ? 72 : 
                       mainContent.className?.includes("text-5xl") ? 48 : 64,
            }]}
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
    <SafeAreaView style={styles.container}>
      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.row}>
                <Settings size={20} color={colors.white} />
                <Text style={styles.modalTitle}>Settings</Text>
              </View>
              <Pressable style={styles.iconButton} onPress={closeSettings}>
                <X size={24} color={colors.white} />
              </Pressable>
            </View>

            {/* Peak Reps */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Pyramid Peak</Text>
              <View style={styles.peakControl}>
                <Pressable style={styles.peakButton} onPress={() => handleSetPeak(Math.max(3, context.peakReps - 1))}>
                  <ChevronDown size={24} color={colors.white} />
                </Pressable>
                <View style={styles.peakValue}>
                  <Text style={[styles.peakNumber, styles.tabularNums]}>{context.peakReps}</Text>
                  <Text style={styles.peakLabel}>Peak Reps</Text>
                </View>
                <Pressable style={styles.peakButton} onPress={() => handleSetPeak(Math.min(20, context.peakReps + 1))}>
                  <ChevronUp size={24} color={colors.white} />
                </Pressable>
              </View>
              <Text style={[styles.volumeText, styles.tabularNums]}>Total Volume: {totalVolume} Push-ups</Text>
            </View>

            {/* Tempo */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Rep Speed</Text>
              <View style={styles.tempoRow}>
                {tempoOptions.map((opt) => (
                  <Pressable
                    key={opt.label}
                    style={[styles.tempoButton, context.tempoMs === opt.ms && styles.tempoButtonActive]}
                    onPress={() => handleSetTempo(opt.ms)}
                  >
                    <Text style={[styles.tempoText, context.tempoMs === opt.ms && styles.tempoTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable style={styles.doneButton} onPress={closeSettings}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Main App */}
      <View style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={[styles.statusDot, status === "working" && styles.statusDotActive]} />
            <Text style={styles.headerTitle}>PYRAMID PUSH</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable style={styles.iconButton} disabled={!canSetPeak} onPress={openSettings}>
              <Settings size={20} color={canSetPeak ? colors.zinc300 : colors.zinc600} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleToggleMute}>
              {context.isMuted ? <VolumeX size={20} color={colors.zinc300} /> : <Volume2 size={20} color={colors.zinc300} />}
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleReset}>
              <RefreshCw size={20} color={colors.rose400} />
            </Pressable>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${status === "finished" ? 100 : progressPercent}%` }]} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>SET</Text>
              <Text style={[styles.statValue, styles.tabularNums]}>{currentTargetReps || "-"}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>VOLUME</Text>
              <Text style={[styles.statValue, styles.tabularNums]}>
                <Text style={{ color: colors.white }}>{completedVolume}</Text>
                <Text style={{ color: colors.zinc500 }}>/{totalVolume}</Text>
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>NEXT</Text>
              <Text style={[styles.statValue, styles.tabularNums, { color: colors.zinc500 }]}>
                {nextSetReps ?? "-"}
              </Text>
            </View>
          </View>

          {/* Circle Button */}
          <Pressable style={styles.circleButton} onPress={handleMainClick}>
            <Svg width={size} height={size} style={styles.svg}>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.zinc900} strokeWidth={strokeWidth} fill="transparent" />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill={status === "idle" ? "transparent" : colors.zinc950}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.circleContent}>
              {renderMainContent()}
              <Text style={styles.subText}>{getSubText()}</Text>
              {status === "finished" && (
                <Text style={[styles.finishReps, styles.tabularNums]}>{totalVolume} Reps</Text>
              )}
            </View>
          </Pressable>

          {/* Pyramid Bars */}
          <View style={styles.pyramidContainer}>
            {context.pyramidSets.map((reps, idx) => {
              const isFinished = status === "finished";
              const isCompleted = isFinished || idx < context.currentSetIndex;
              const isCurrent = !isFinished && idx === context.currentSetIndex;
              const heightPercent = (reps / context.peakReps) * 100;

              return (
                <View
                  key={idx}
                  style={[
                    styles.pyramidBar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isCurrent ? colors.lime400 : isCompleted ? colors.lime600 : colors.zinc800,
                      opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.4,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Bottom Controls */}
          <View style={styles.controls}>
            {status === "idle" && (
              <Text style={styles.hint}>Tap the settings icon to change pyramid height.</Text>
            )}

            {(canSkipRest || canPause) && (
              <View style={styles.row}>
                {canSkipRest && (
                  <Pressable style={styles.primaryButton} onPress={() => send({ type: "SKIP_REST" })}>
                    <SkipForward size={24} color={colors.white} />
                    <Text style={styles.buttonText}>Skip Rest</Text>
                  </Pressable>
                )}
                {canPause && (
                  <Pressable style={styles.secondaryButton} onPress={() => send({ type: "PAUSE" })}>
                    <Pause size={24} color={colors.zinc300} />
                    <Text style={[styles.buttonText, { color: colors.zinc300 }]}>Pause</Text>
                  </Pressable>
                )}
              </View>
            )}

            {canResume && (
              <Pressable style={styles.resumeButton} onPress={() => send({ type: "RESUME" })}>
                <Play size={24} color={colors.white} />
                <Text style={styles.buttonText}>Resume</Text>
              </Pressable>
            )}

            {status === "finished" && (
              <View style={styles.row}>
                <Pressable style={styles.shareButton}>
                  <Text style={styles.buttonText}>🎉 Share</Text>
                </Pressable>
                <Pressable style={styles.resetButton} onPress={handleReset}>
                  <RefreshCw size={24} color={colors.white} />
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },
  main: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.zinc900,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.slate500,
  },
  statusDotActive: {
    backgroundColor: colors.lime500,
  },
  // Progress
  progressTrack: {
    height: 8,
    backgroundColor: colors.zinc900,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.lime500,
  },
  // Content
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 600,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: `${colors.zinc900}80`,
    borderWidth: 1,
    borderColor: `${colors.white}08`,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.zinc500,
    letterSpacing: 2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.white,
  },
  // Circle
  circleButton: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  circleContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -2,
  },
  subText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.zinc400,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 8,
  },
  finishReps: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 8,
  },
  tabularNums: {
    fontVariant: ["tabular-nums"],
  },
  // Pyramid
  pyramidContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 64,
    width: "100%",
    maxWidth: 600,
    paddingHorizontal: 8,
    gap: 2,
  },
  pyramidBar: {
    flex: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Controls
  controls: {
    height: 96,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 12,
    color: colors.zinc500,
    textAlign: "center",
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.zinc800,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.zinc900,
    borderWidth: 1,
    borderColor: colors.zinc700,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.amber500,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.purple600,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  resetButton: {
    backgroundColor: colors.zinc800,
    padding: 16,
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: `${colors.zinc950}F2`,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.zinc900,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.zinc700,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginLeft: 8,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.zinc400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  peakControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.zinc950,
    borderRadius: 12,
    padding: 16,
  },
  peakButton: {
    backgroundColor: colors.zinc900,
    padding: 12,
    borderRadius: 8,
  },
  peakValue: {
    alignItems: "center",
  },
  peakNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.white,
  },
  peakLabel: {
    fontSize: 12,
    color: colors.zinc500,
  },
  volumeText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: colors.lime400,
    marginTop: 8,
  },
  tempoRow: {
    flexDirection: "row",
    gap: 8,
  },
  tempoButton: {
    flex: 1,
    backgroundColor: colors.zinc950,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tempoButtonActive: {
    backgroundColor: colors.blue600,
  },
  tempoText: {
    fontWeight: "bold",
    color: colors.zinc400,
  },
  tempoTextActive: {
    color: colors.white,
  },
  doneButton: {
    backgroundColor: colors.zinc800,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
});
