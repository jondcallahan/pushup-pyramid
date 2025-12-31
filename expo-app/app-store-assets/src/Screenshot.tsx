import React from "react";
import { AbsoluteFill } from "remotion";

type ScreenType = "idle" | "working" | "rest" | "finished";

const COLORS = {
  bg: "#09090b",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc400: "#a1a1aa",
  lime400: "#a3e635",
  lime500: "#84cc16",
  yellow400: "#facc15",
  fuchsia400: "#e879f9",
  white: "#ffffff",
};

const screenData: Record<
  ScreenType,
  {
    title: string;
    subtitle: string;
    centerContent: React.ReactNode;
    strokeColor: string;
    pyramidHighlight: number;
    reps: string;
    volume: string;
  }
> = {
  idle: {
    title: "Ready to push?",
    subtitle: "Tap to start",
    centerContent: (
      <div style={{ fontSize: 120, color: COLORS.lime400 }}>▶</div>
    ),
    strokeColor: COLORS.zinc600,
    pyramidHighlight: -1,
    reps: "100",
    volume: "0 / 100",
  },
  working: {
    title: "Push!",
    subtitle: "Set 5 of 9",
    centerContent: (
      <div style={{ fontSize: 200, fontWeight: 900, color: COLORS.white }}>
        10
      </div>
    ),
    strokeColor: COLORS.lime400,
    pyramidHighlight: 4,
    reps: "10",
    volume: "35 / 100",
  },
  rest: {
    title: "Rest",
    subtitle: "Next: 9 reps",
    centerContent: (
      <div style={{ fontSize: 180, fontWeight: 900, color: COLORS.white }}>
        12s
      </div>
    ),
    strokeColor: "#38bdf8",
    pyramidHighlight: 5,
    reps: "—",
    volume: "45 / 100",
  },
  finished: {
    title: "Done!",
    subtitle: "100 push-ups complete",
    centerContent: (
      <div style={{ fontSize: 120 }}>🏆</div>
    ),
    strokeColor: COLORS.fuchsia400,
    pyramidHighlight: -1,
    reps: "100",
    volume: "100 / 100",
  },
};

const PyramidBar: React.FC<{
  height: number;
  active: boolean;
  completed: boolean;
}> = ({ height, active, completed }) => {
  const maxHeight = 60;
  const barHeight = (height / 10) * maxHeight;
  
  let color = COLORS.zinc700;
  if (completed) color = COLORS.lime500;
  if (active) color = COLORS.lime400;

  return (
    <div
      style={{
        width: 28,
        height: barHeight,
        backgroundColor: color,
        borderRadius: "6px 6px 0 0",
        opacity: active || completed ? 1 : 0.5,
      }}
    />
  );
};

const Pyramid: React.FC<{ highlightIndex: number }> = ({ highlightIndex }) => {
  const bars = [1, 2, 3, 4, 10, 4, 3, 2, 1]; // Peak at index 4

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 8,
        height: 80,
      }}
    >
      {bars.map((height, idx) => (
        <PyramidBar
          key={idx}
          height={height}
          active={idx === highlightIndex}
          completed={idx < highlightIndex}
        />
      ))}
    </div>
  );
};

const CircularProgress: React.FC<{
  progress: number;
  strokeColor: string;
  children: React.ReactNode;
}> = ({ progress, strokeColor, children }) => {
  const size = 500;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.zinc800}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Screenshot: React.FC<{ screen: ScreenType }> = ({ screen }) => {
  const data = screenData[screen];
  const progress =
    screen === "idle"
      ? 0
      : screen === "finished"
        ? 1
        : screen === "working"
          ? 0.35
          : 0.45;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: COLORS.white,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              fontSize: 36,
              color: COLORS.zinc400,
              marginTop: 8,
            }}
          >
            {data.subtitle}
          </div>
        </div>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: COLORS.zinc800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 28, color: COLORS.zinc400 }}>⚙</div>
        </div>
      </div>

      {/* Main content - circular progress */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress progress={progress} strokeColor={data.strokeColor}>
          {data.centerContent}
        </CircularProgress>
      </div>

      {/* Pyramid */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 60,
        }}
      >
        <Pyramid highlightIndex={data.pyramidHighlight} />
      </div>

      {/* Bottom stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingBottom: 80,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}>
            {data.reps}
          </div>
          <div style={{ fontSize: 28, color: COLORS.zinc400 }}>REPS</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}>
            {data.volume}
          </div>
          <div style={{ fontSize: 28, color: COLORS.zinc400 }}>VOLUME</div>
        </div>
      </div>

      {/* Marketing text overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.lime400,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {screen === "idle" && "100 Push-ups. One Workout."}
          {screen === "working" && "Audio-guided reps"}
          {screen === "rest" && "Smart rest timers"}
          {screen === "finished" && "Track your progress"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
