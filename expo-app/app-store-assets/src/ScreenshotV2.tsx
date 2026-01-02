import { Trophy } from "@phosphor-icons/react";
import type React from "react";
import { AbsoluteFill } from "remotion";

const PyramidIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
    {/* Left bar */}
    <rect x="198" y="395" width="175" height="340" rx="24" fill="#09090b"/>
    {/* Center bar (tallest) */}
    <rect x="424" y="255" width="175" height="480" rx="24" fill="#09090b"/>
    {/* Right bar */}
    <rect x="650" y="395" width="175" height="340" rx="24" fill="#09090b"/>
  </svg>
);

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
    headline: string;
    subheadline: string;
  }
> = {
  idle: {
    strokeColor: COLORS.zinc600,
    mainContent: (
      <svg
        fill="none"
        height="100"
        stroke={COLORS.lime400}
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="100"
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
    headline: "100 Push-ups",
    subheadline: "One Workout. 10 Minutes.",
  },
  working: {
    strokeColor: COLORS.lime400,
    mainContent: (
      <span style={{ fontSize: 150, fontWeight: 900, color: COLORS.white }}>
        10
      </span>
    ),
    subText: "5 / 10 reps",
    currentReps: 10,
    completedVolume: 35,
    totalVolume: 100,
    pyramidHighlight: 4,
    progressPercent: 35,
    headline: "Audio-Guided",
    subheadline: "Just listen and push.",
  },
  rest: {
    strokeColor: COLORS.cyan400,
    mainContent: (
      <span style={{ fontSize: 130, fontWeight: 900, color: COLORS.white }}>
        12s
      </span>
    ),
    subText: "REST",
    currentReps: "—",
    completedVolume: 45,
    totalVolume: 100,
    pyramidHighlight: 5,
    progressPercent: 45,
    headline: "Smart Rest",
    subheadline: "Recover just enough.",
  },
  finished: {
    strokeColor: COLORS.fuchsia400,
    mainContent: <Trophy size={130} weight="fill" color={COLORS.fuchsia400} />,
    subText: "DONE!",
    currentReps: 100,
    completedVolume: 100,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 100,
    headline: "Syncs to Health",
    subheadline: "Automatic Apple Health integration.",
  },
};

const PhoneMockup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: 680,
        height: 1420,
        borderRadius: 90,
        background: "#1a1a1a",
        padding: 16,
        boxShadow: "0 50px 100px -24px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 74,
          background: COLORS.bg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 56,
            borderRadius: 36,
            background: "#000",
          }}
        />
        {children}
      </div>
    </div>
  );
};

const AppUI: React.FC<{ config: typeof screenData.idle }> = ({ config }) => {
  const pyramidSets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const peakReps = 10;
  const size = 420;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = config.progressPercent / 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        marginTop: 80,
      }}
    >
      {/* Circular Progress */}
      <div style={{ position: "relative", marginBottom: 36 }}>
        <svg height={size} style={{ transform: "rotate(-90deg)" }} width={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={COLORS.zinc800}
            strokeWidth={strokeWidth}
          />
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
      <div style={{ fontSize: 36, color: COLORS.zinc400, marginBottom: 48 }}>
        {config.subText}
      </div>

      {/* Pyramid */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 6,
          height: 90,
          marginBottom: 36,
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
                width: 18,
                height: `${heightPercent}%`,
                backgroundColor: bgColor,
                borderRadius: "5px 5px 0 0",
              }}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 90, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 54, fontWeight: 700, color: COLORS.white }}>
            {config.currentReps}
          </div>
          <div style={{ fontSize: 20, color: COLORS.zinc500 }}>REPS</div>
        </div>
        <div>
          <div style={{ fontSize: 54, fontWeight: 700, color: COLORS.white }}>
            {config.completedVolume}/{config.totalVolume}
          </div>
          <div style={{ fontSize: 20, color: COLORS.zinc500 }}>VOLUME</div>
        </div>
      </div>
    </div>
  );
};

export const ScreenshotV2: React.FC<{ screen: ScreenType }> = ({ screen }) => {
  const config = screenData[screen];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 60,
      }}
    >
      {/* Headline at top */}
      <div
        style={{
          marginTop: 100,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.1,
          }}
        >
          {config.headline}
        </div>
        <div
          style={{
            fontSize: 36,
            color: COLORS.zinc400,
            marginTop: 16,
          }}
        >
          {config.subheadline}
        </div>
      </div>

      {/* Phone mockup with app */}
      <div style={{ marginTop: 20, flex: 1, display: "flex", alignItems: "center" }}>
        <PhoneMockup>
          <AppUI config={config} />
        </PhoneMockup>
      </div>

      {/* App name at bottom */}
      <div
        style={{
          marginBottom: 80,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.lime600} 0%, ${COLORS.lime400} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PyramidIcon size={48} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.white }}>
          Pyramid Push
        </div>
      </div>
    </AbsoluteFill>
  );
};
