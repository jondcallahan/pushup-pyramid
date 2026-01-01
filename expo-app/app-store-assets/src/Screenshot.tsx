import type React from "react";
import { AbsoluteFill } from "remotion";

type ScreenType = "idle" | "working" | "rest" | "finished";

const COLORS = {
  bg: "#09090b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  lime400: "#a3e635",
  lime600: "#65a30d",
  cyan400: "#22d3ee",
  fuchsia400: "#e879f9",
  yellow400: "#facc15",
  white: "#ffffff",
};

const screenData: Record<
  ScreenType,
  {
    strokeColor: string;
    mainContent: React.ReactNode;
    subText: string;
    currentReps: number | string;
    completedVolume: number;
    totalVolume: number;
    pyramidHighlight: number;
    progressPercent: number;
    marketingText: string;
  }
> = {
  idle: {
    strokeColor: COLORS.zinc600,
    mainContent: (
      <svg
        fill="none"
        height="64"
        stroke={COLORS.lime400}
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="64"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    subText: "Tap to Start",
    currentReps: "—",
    completedVolume: 0,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 0,
    marketingText: "100 Push-ups. One Workout.",
  },
  working: {
    strokeColor: COLORS.lime400,
    mainContent: (
      <span style={{ fontSize: 140, fontWeight: 900, color: COLORS.white }}>
        10
      </span>
    ),
    subText: "5 / 10 reps",
    currentReps: 10,
    completedVolume: 35,
    totalVolume: 100,
    pyramidHighlight: 4,
    progressPercent: 35,
    marketingText: "Audio-guided reps",
  },
  rest: {
    strokeColor: COLORS.cyan400,
    mainContent: (
      <span style={{ fontSize: 120, fontWeight: 900, color: COLORS.white }}>
        12s
      </span>
    ),
    subText: "REST & RECOVER",
    currentReps: "—",
    completedVolume: 45,
    totalVolume: 100,
    pyramidHighlight: 5,
    progressPercent: 45,
    marketingText: "Smart rest timers",
  },
  finished: {
    strokeColor: COLORS.fuchsia400,
    mainContent: <span style={{ fontSize: 100 }}>🏆</span>,
    subText: "GREAT JOB!",
    currentReps: 100,
    completedVolume: 100,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 100,
    marketingText: "Syncs with Apple Health",
  },
};

export const Screenshot: React.FC<{ screen: ScreenType }> = ({ screen }) => {
  const config = screenData[screen];
  // Pyramid for peak 10: 1,2,3,4,5,6,7,8,9,10,9,8,7,6,5,4,3,2,1
  const pyramidSets = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  ];
  const peakReps = 10;

  // SVG circle config - scaled up for screenshot
  const size = 420;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = config.progressPercent / 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Circular Progress */}
      <div style={{ position: "relative", marginBottom: 40 }}>
        <svg height={size} style={{ transform: "rotate(-90deg)" }} width={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={COLORS.zinc800}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={config.strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress * circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
        {/* Center content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {config.mainContent}
        </div>
      </div>

      {/* Status text */}
      <div style={{ fontSize: 36, color: COLORS.zinc400, marginBottom: 50 }}>
        {config.subText}
      </div>

      {/* Pyramid visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 6,
          height: 80,
          marginBottom: 50,
        }}
      >
        {pyramidSets.map((reps, index) => {
          const heightPercent = (reps / peakReps) * 100;
          const isCompleted = index < config.pyramidHighlight;
          const isCurrent = index === config.pyramidHighlight;

          let bgColor = COLORS.zinc700;
          if (isCurrent) bgColor = COLORS.lime400;
          else if (isCompleted) bgColor = COLORS.lime600;

          return (
            <div
              key={index}
              style={{
                width: 16,
                height: `${heightPercent}%`,
                backgroundColor: bgColor,
                borderRadius: "4px 4px 0 0",
              }}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 120,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <div>
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}>
            {config.currentReps}
          </div>
          <div style={{ fontSize: 20, color: COLORS.zinc500 }}>REPS</div>
        </div>
        <div>
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}>
            {config.completedVolume} / {config.totalVolume}
          </div>
          <div style={{ fontSize: 20, color: COLORS.zinc500 }}>VOLUME</div>
        </div>
      </div>

      {/* Marketing text */}
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          color: COLORS.lime400,
          textTransform: "uppercase",
          letterSpacing: 3,
        }}
      >
        {config.marketingText}
      </div>
    </AbsoluteFill>
  );
};
