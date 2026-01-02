import { AbsoluteFill } from "remotion";

const COLORS = {
  bg: "#09090b",
  lime400: "#a3e635",
  zinc400: "#a1a1aa",
  white: "#ffffff",
};

export const OgImage: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 80,
      }}
    >
      {/* Left side - Text */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            marginBottom: 16,
          }}
        >
          Pyramid Push
        </div>
        <div
          style={{
            fontSize: 36,
            color: COLORS.lime400,
            marginBottom: 32,
          }}
        >
          100 Push-ups. One Workout.
        </div>
        <div
          style={{
            fontSize: 28,
            color: COLORS.zinc400,
            lineHeight: 1.5,
          }}
        >
          Audio-guided pyramid training
          <br />
          No equipment. No excuses.
        </div>
      </div>

      {/* Right side - Pyramid visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 8,
          height: 300,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(
          (reps, index) => (
            <div
              key={index}
              style={{
                width: 20,
                height: `${(reps / 10) * 100}%`,
                backgroundColor: COLORS.lime400,
                borderRadius: "6px 6px 0 0",
              }}
            />
          )
        )}
      </div>
    </AbsoluteFill>
  );
};
