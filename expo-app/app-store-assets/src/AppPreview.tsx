import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

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
  sky400: "#38bdf8",
  white: "#ffffff",
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
  const bars = [1, 2, 3, 4, 10, 4, 3, 2, 1];

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
          active={idx === highlightIndex}
          completed={idx < highlightIndex}
          height={height}
          key={idx}
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
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
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

// Timeline: 30 seconds (900 frames at 30fps)
// 0-3s: Intro/title
// 3-8s: Idle state, tap to start
// 8-10s: Countdown
// 10-20s: Working (show a few reps)
// 20-25s: Rest timer
// 25-30s: Finished celebration

export const AppPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  const introEnd = 3 * fps;
  const idleEnd = 8 * fps;
  const countdownEnd = 10 * fps;
  const workingEnd = 20 * fps;
  const restEnd = 25 * fps;

  // Determine current scene
  let scene: "intro" | "idle" | "countdown" | "working" | "rest" | "finished";
  if (frame < introEnd) scene = "intro";
  else if (frame < idleEnd) scene = "idle";
  else if (frame < countdownEnd) scene = "countdown";
  else if (frame < workingEnd) scene = "working";
  else if (frame < restEnd) scene = "rest";
  else scene = "finished";

  // Intro animation
  const introOpacity = interpolate(
    frame,
    [0, 30, introEnd - 30, introEnd],
    [0, 1, 1, 0],
    {
      extrapolateRight: "clamp",
    }
  );

  // Working rep counter (cycle through reps)
  const workingFrame = frame - countdownEnd;
  const repDuration = fps * 1.5; // 1.5 seconds per rep
  const currentRep = Math.floor(workingFrame / repDuration) + 1;
  const repProgress = (workingFrame % repDuration) / repDuration;

  // Rest countdown
  const restFrame = frame - workingEnd;
  const restSeconds = Math.max(0, 15 - Math.floor(restFrame / fps));

  // Progress through workout
  const workoutProgress = interpolate(frame, [idleEnd, restEnd], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stroke color based on scene
  const strokeColor =
    scene === "working"
      ? COLORS.lime400
      : scene === "rest"
        ? COLORS.sky400
        : scene === "finished"
          ? COLORS.fuchsia400
          : COLORS.zinc600;

  // Bounce animation for trophy
  const trophyBounce = spring({
    frame: frame - restEnd,
    fps,
    config: { damping: 8, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Intro overlay */}
      {scene === "intro" && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: introOpacity,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: COLORS.white,
              }}
            >
              PYRAMID
            </div>
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: COLORS.lime400,
              }}
            >
              PUSH
            </div>
            <div
              style={{
                fontSize: 48,
                color: COLORS.zinc400,
                marginTop: 40,
              }}
            >
              100 push-ups. One workout.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Main app UI */}
      {scene !== "intro" && (
        <div
          style={{
            padding: 60,
            display: "flex",
            flexDirection: "column",
            height: "100%",
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
                {scene === "idle" && "Ready?"}
                {scene === "countdown" && "Get set..."}
                {scene === "working" && "Push!"}
                {scene === "rest" && "Rest"}
                {scene === "finished" && "Done! 🎉"}
              </div>
              <div
                style={{
                  fontSize: 36,
                  color: COLORS.zinc400,
                  marginTop: 8,
                }}
              >
                {scene === "idle" && "Tap to start"}
                {scene === "countdown" && "Starting soon"}
                {scene === "working" && "Set 5 of 9"}
                {scene === "rest" && "Next: 9 reps"}
                {scene === "finished" && "100 push-ups complete"}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              progress={scene === "finished" ? 1 : workoutProgress}
              strokeColor={strokeColor}
            >
              {scene === "idle" && (
                <div style={{ fontSize: 120, color: COLORS.lime400 }}>▶</div>
              )}
              {scene === "countdown" && (
                <div
                  style={{
                    fontSize: 200,
                    fontWeight: 900,
                    color: COLORS.white,
                  }}
                >
                  {3 - Math.floor((frame - idleEnd) / fps)}
                </div>
              )}
              {scene === "working" && (
                <div
                  style={{
                    fontSize: 200,
                    fontWeight: 900,
                    color: COLORS.white,
                    transform: `scale(${1 + Math.sin(repProgress * Math.PI) * 0.1})`,
                  }}
                >
                  {Math.min(currentRep, 10)}
                </div>
              )}
              {scene === "rest" && (
                <div
                  style={{
                    fontSize: 180,
                    fontWeight: 900,
                    color: COLORS.white,
                  }}
                >
                  {restSeconds}s
                </div>
              )}
              {scene === "finished" && (
                <div
                  style={{
                    fontSize: 120,
                    transform: `translateY(${-10 * trophyBounce}px)`,
                  }}
                >
                  🏆
                </div>
              )}
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
            <Pyramid
              highlightIndex={
                scene === "working" ? 4 : scene === "rest" ? 5 : -1
              }
            />
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
              <div
                style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}
              >
                {scene === "working"
                  ? Math.min(currentRep, 10)
                  : scene === "finished"
                    ? "100"
                    : "—"}
              </div>
              <div style={{ fontSize: 28, color: COLORS.zinc400 }}>REPS</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 56, fontWeight: 700, color: COLORS.white }}
              >
                {scene === "finished"
                  ? "100"
                  : Math.floor(workoutProgress * 100)}{" "}
                / 100
              </div>
              <div style={{ fontSize: 28, color: COLORS.zinc400 }}>VOLUME</div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
