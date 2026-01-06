import { Trophy } from "@phosphor-icons/react";
import type React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const lofiBeats = staticFile("lofi-beats.mp4");

const COLORS = {
  bg: "#09090b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  lime400: "#a3e635",
  lime500: "#84cc16",
  lime600: "#65a30d",
  cyan400: "#22d3ee",
  fuchsia400: "#e879f9",
  white: "#ffffff",
};

const PyramidIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
    <rect x="198" y="395" width="175" height="340" rx="24" fill="#09090b"/>
    <rect x="424" y="255" width="175" height="480" rx="24" fill="#09090b"/>
    <rect x="650" y="395" width="175" height="340" rx="24" fill="#09090b"/>
  </svg>
);

const PhoneMockup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: 380,
        height: 800,
        borderRadius: 52,
        background: "#1a1a1a",
        padding: 10,
        boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 42,
          background: COLORS.bg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 32,
            borderRadius: 20,
            background: "#000",
          }}
        />
        {children}
      </div>
    </div>
  );
};

const AppUI: React.FC<{
  scene: string;
  currentRep: number;
  restSeconds: number;
  workoutProgress: number;
  repProgress: number;
  trophyBounce: number;
  pyramidHighlight: number;
}> = ({ scene, currentRep, restSeconds, workoutProgress, repProgress, trophyBounce, pyramidHighlight }) => {
  const pyramidSets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const peakReps = 10;
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = scene === "finished" ? 1 : workoutProgress;

  const strokeColor =
    scene === "working" ? COLORS.lime400 :
    scene === "rest" ? COLORS.cyan400 :
    scene === "finished" ? COLORS.fuchsia400 :
    COLORS.zinc600;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        marginTop: 40,
      }}
    >
      <div style={{ position: "relative", marginBottom: 16 }}>
        <svg height={size} style={{ transform: "rotate(-90deg)" }} width={size}>
          <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke={COLORS.zinc800} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke={strokeColor} strokeDasharray={circumference} strokeDashoffset={circumference - progress * circumference} strokeLinecap="round" strokeWidth={strokeWidth} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {scene === "idle" && (
            <svg fill="none" height="50" stroke={COLORS.lime400} strokeWidth="2" viewBox="0 0 24 24" width="50">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
          {scene === "countdown" && (
            <span style={{ fontSize: 80, fontWeight: 900, color: COLORS.white }}>{restSeconds}</span>
          )}
          {scene === "working" && (
            <span style={{ fontSize: 80, fontWeight: 900, color: COLORS.white, transform: `scale(${1 + Math.sin(repProgress * Math.PI) * 0.1})` }}>{currentRep}</span>
          )}
          {scene === "rest" && (
            <span style={{ fontSize: 70, fontWeight: 900, color: COLORS.white }}>{restSeconds}s</span>
          )}
          {scene === "finished" && (
            <div style={{ transform: `translateY(${-5 * trophyBounce}px)` }}>
              <Trophy size={70} weight="fill" color={COLORS.fuchsia400} />
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 18, color: COLORS.zinc400, marginBottom: 20 }}>
        {scene === "idle" && "Tap to Start"}
        {scene === "countdown" && "Get Ready"}
        {scene === "working" && `${currentRep} / 10 reps`}
        {scene === "rest" && "REST"}
        {scene === "finished" && "DONE!"}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 45, marginBottom: 16 }}>
        {pyramidSets.map((reps, index) => {
          const heightPercent = (reps / peakReps) * 100;
          const isCompleted = index < pyramidHighlight;
          const isCurrent = index === pyramidHighlight;
          let bgColor = COLORS.zinc700;
          if (isCurrent) bgColor = COLORS.lime400;
          else if (isCompleted) bgColor = COLORS.lime600;
          return (
            <div key={index} style={{ width: 10, height: `${heightPercent}%`, backgroundColor: bgColor, borderRadius: "3px 3px 0 0" }} />
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 50, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.white }}>
            {scene === "working" ? currentRep : scene === "finished" ? "100" : "—"}
          </div>
          <div style={{ fontSize: 11, color: COLORS.zinc500 }}>REPS</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.white }}>
            {scene === "finished" ? "100" : Math.floor(workoutProgress * 100)}/100
          </div>
          <div style={{ fontSize: 11, color: COLORS.zinc500 }}>VOLUME</div>
        </div>
      </div>
    </div>
  );
};

export const AppPreviewV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introEnd = 3 * fps;
  const idleEnd = 8 * fps;
  const countdownEnd = 10 * fps;
  const workingEnd = 20 * fps;
  const restEnd = 25 * fps;

  let scene: string;
  if (frame < introEnd) scene = "intro";
  else if (frame < idleEnd) scene = "idle";
  else if (frame < countdownEnd) scene = "countdown";
  else if (frame < workingEnd) scene = "working";
  else if (frame < restEnd) scene = "rest";
  else scene = "finished";

  const introOpacity = interpolate(frame, [0, 30, introEnd - 30, introEnd], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  const workingFrame = frame - countdownEnd;
  const repDuration = fps * 1.5;
  const currentRep = Math.min(Math.floor(workingFrame / repDuration) + 1, 10);
  const repProgress = (workingFrame % repDuration) / repDuration;

  const restFrame = frame - workingEnd;
  const restSeconds = scene === "countdown" 
    ? Math.max(1, 3 - Math.floor((frame - idleEnd) / fps))
    : Math.max(0, 15 - Math.floor(restFrame / fps));

  const workoutProgress = interpolate(frame, [idleEnd, restEnd], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const trophyBounce = spring({ frame: frame - restEnd, fps, config: { damping: 8, stiffness: 100 } });

  const pyramidHighlight = scene === "working" ? 4 : scene === "rest" ? 5 : scene === "finished" ? 19 : -1;

  const headlines: Record<string, { main: string; sub: string }> = {
    intro: { main: "Pyramid Push", sub: "100 Push-ups. One Workout." },
    idle: { main: "100 Push-ups", sub: "One Workout. 10 Minutes." },
    countdown: { main: "Get Ready", sub: "Starting soon..." },
    working: { main: "Audio-Guided", sub: "Just listen and push." },
    rest: { main: "Smart Rest", sub: "Recover just enough." },
    finished: { main: "Syncs to Health", sub: "Workout saved!" },
  };

  const headline = headlines[scene] || headlines.idle;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 40,
      }}
    >
      <Audio src={lofiBeats} volume={0.75} />
      {scene === "intro" ? (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: introOpacity,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, color: COLORS.white }}>PYRAMID</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: COLORS.lime400 }}>PUSH</div>
          <div style={{ fontSize: 24, color: COLORS.zinc400, marginTop: 20 }}>100 push-ups. One workout.</div>
        </AbsoluteFill>
      ) : (
        <>
          <div style={{ marginTop: 60, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.white, lineHeight: 1.1 }}>{headline.main}</div>
            <div style={{ fontSize: 20, color: COLORS.zinc400, marginTop: 8 }}>{headline.sub}</div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <PhoneMockup>
              <AppUI
                scene={scene}
                currentRep={currentRep}
                restSeconds={restSeconds}
                workoutProgress={workoutProgress}
                repProgress={repProgress}
                trophyBounce={trophyBounce}
                pyramidHighlight={pyramidHighlight}
              />
            </PhoneMockup>
          </div>

          <div style={{ marginBottom: 50, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: `linear-gradient(135deg, ${COLORS.lime600} 0%, ${COLORS.lime400} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PyramidIcon size={32} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white }}>Pyramid Push</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
