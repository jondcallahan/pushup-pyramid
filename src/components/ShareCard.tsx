import { forwardRef } from "react";

interface ShareCardProps {
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
  date: Date;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ totalVolume, peakReps, setsCompleted, date }, ref) => {
    const formattedDate = date
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();

    // Rank based on volume
    const getRank = () => {
      if (totalVolume >= 200)
        return { title: "CHAMPION", emoji: "🏆", tier: 5 };
      if (totalVolume >= 150)
        return { title: "CONTENDER", emoji: "🔥", tier: 4 };
      if (totalVolume >= 100) return { title: "WARRIOR", emoji: "⚔️", tier: 3 };
      if (totalVolume >= 50) return { title: "FIGHTER", emoji: "💪", tier: 2 };
      return { title: "ROOKIE", emoji: "🌱", tier: 1 };
    };

    const rank = getRank();

    return (
      <div
        className="relative h-[520px] w-[390px] overflow-hidden"
        ref={ref}
        style={{
          // Aged parchment with burnt edges feel
          background: `
            radial-gradient(ellipse at 20% 0%, #8B0000 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, #8B0000 0%, transparent 50%),
            linear-gradient(175deg, #F5E6D3 0%, #E8D4BC 30%, #DCC5A5 60%, #D4B896 100%)
          `,
        }}
      >
        {/* Google Fonts - Loaded inline for image generation */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        `}</style>

        {/* Ink splatter texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 85%, #000 0%, transparent 8%),
              radial-gradient(circle at 85% 20%, #000 0%, transparent 6%),
              radial-gradient(circle at 45% 45%, #000 0%, transparent 3%),
              radial-gradient(circle at 70% 70%, #000 0%, transparent 4%)
            `,
          }}
        />

        {/* Worn creases effect */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `
              linear-gradient(90deg, transparent 49.5%, #5C4033 49.5%, #5C4033 50.5%, transparent 50.5%),
              linear-gradient(0deg, transparent 49.5%, #5C4033 49.5%, #5C4033 50.5%, transparent 50.5%)
            `,
          }}
        />

        {/* Decorative border - vintage ticket style */}
        <div
          className="absolute inset-2"
          style={{
            border: "3px double #8B0000",
            boxShadow: "inset 0 0 0 6px #F5E6D3, inset 0 0 0 8px #8B0000",
          }}
        />

        {/* Corner ornaments */}
        {[
          "top-4 left-4",
          "top-4 right-4 rotate-90",
          "bottom-4 left-4 -rotate-90",
          "bottom-4 right-4 rotate-180",
        ].map((pos, i) => (
          <div className={`absolute ${pos} h-8 w-8 opacity-60`} key={i}>
            <svg fill="#8B0000" viewBox="0 0 32 32">
              <path d="M0 0 L12 0 L12 3 L3 3 L3 12 L0 12 Z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col px-8 py-6">
          {/* Top ribbon banner */}
          <div className="-mx-8 relative mb-3">
            <div
              className="py-2 text-center"
              style={{
                background: "linear-gradient(180deg, #8B0000 0%, #660000 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  fontFamily: '"Libre Baskerville", Georgia, serif',
                  fontSize: "10px",
                  letterSpacing: "0.35em",
                  color: "#F5E6D3",
                  textTransform: "uppercase",
                }}
              >
                ✦ Certificate of Completion ✦
              </span>
            </div>
            {/* Ribbon folds */}
            <div
              className="-bottom-2 absolute left-0 h-2 w-4"
              style={{
                background:
                  "linear-gradient(135deg, #4A0000 50%, transparent 50%)",
              }}
            />
            <div
              className="-bottom-2 absolute right-0 h-2 w-4"
              style={{
                background:
                  "linear-gradient(-135deg, #4A0000 50%, transparent 50%)",
              }}
            />
          </div>

          {/* Date with flourish */}
          <div className="mb-2 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <div
                className="h-px w-8"
                style={{
                  background: "linear-gradient(90deg, transparent, #8B0000)",
                }}
              />
              <span
                style={{
                  fontFamily: '"Libre Baskerville", serif',
                  fontSize: "9px",
                  color: "#5C4033",
                  letterSpacing: "0.15em",
                }}
              >
                {formattedDate}
              </span>
              <div
                className="h-px w-8"
                style={{
                  background: "linear-gradient(-90deg, transparent, #8B0000)",
                }}
              />
            </div>
          </div>

          {/* Main title - stacked dramatic */}
          <div className="mb-2 text-center">
            <div
              style={{
                fontFamily: '"Alfa Slab One", Impact, sans-serif',
                fontSize: "52px",
                lineHeight: "0.85",
                color: "#8B0000",
                textShadow: "3px 3px 0 #D4B896, 4px 4px 0 rgba(0,0,0,0.15)",
                letterSpacing: "-0.02em",
              }}
            >
              PYRAMID
            </div>
            <div
              style={{
                fontFamily: '"Alfa Slab One", Impact, sans-serif',
                fontSize: "32px",
                color: "#5C4033",
                letterSpacing: "0.25em",
                marginTop: "-4px",
              }}
            >
              PUSH
            </div>
          </div>

          {/* Decorative divider */}
          <div className="my-2 flex items-center justify-center gap-2">
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #8B0000, transparent)",
              }}
            />
            <div style={{ color: "#8B0000", fontSize: "14px" }}>◆</div>
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #8B0000, transparent)",
              }}
            />
          </div>

          {/* THE BIG NUMBER - Hero section */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div
              style={{
                fontFamily: '"Libre Baskerville", serif',
                fontSize: "11px",
                letterSpacing: "0.4em",
                color: "#5C4033",
                marginBottom: "4px",
              }}
            >
              TOTAL REPETITIONS
            </div>

            <div className="relative">
              {/* Starburst behind number */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-10"
                style={{ transform: "scale(1.8)" }}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    className="absolute h-24 w-1 bg-[#8B0000]"
                    key={i}
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  />
                ))}
              </div>

              <span
                style={{
                  fontFamily: '"Alfa Slab One", Impact, sans-serif',
                  fontSize: "140px",
                  lineHeight: "1",
                  color: "#8B0000",
                  textShadow: `
                    0 0 0 #8B0000,
                    4px 4px 0 #D4B896,
                    6px 6px 0 #5C4033,
                    8px 8px 15px rgba(0,0,0,0.25)
                  `,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {totalVolume}
              </span>
            </div>

            {/* Rank medallion */}
            <div
              className="relative mt-3 px-5 py-2"
              style={{
                background: "linear-gradient(180deg, #8B0000 0%, #660000 100%)",
                clipPath:
                  "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
              }}
            >
              <span
                style={{
                  fontFamily: '"Libre Baskerville", serif',
                  fontSize: "13px",
                  letterSpacing: "0.2em",
                  color: "#F5E6D3",
                  fontWeight: "bold",
                }}
              >
                {rank.emoji} {rank.title} {rank.emoji}
              </span>
            </div>
          </div>

          {/* Stats - vintage ledger style */}
          <div
            className="my-2 py-3"
            style={{
              borderTop: "2px solid #8B0000",
              borderBottom: "2px solid #8B0000",
              background:
                "linear-gradient(180deg, rgba(139,0,0,0.05) 0%, transparent 100%)",
            }}
          >
            <div className="flex justify-around text-center">
              <div>
                <div
                  style={{
                    fontFamily: '"Alfa Slab One", sans-serif',
                    fontSize: "36px",
                    color: "#8B0000",
                    lineHeight: "1",
                  }}
                >
                  {peakReps}
                </div>
                <div
                  style={{
                    fontFamily: '"Libre Baskerville", serif',
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "#5C4033",
                    marginTop: "4px",
                  }}
                >
                  PEAK REPS
                </div>
              </div>

              <div
                className="w-px"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, #8B0000, transparent)",
                }}
              />

              <div>
                <div
                  style={{
                    fontFamily: '"Alfa Slab One", sans-serif',
                    fontSize: "36px",
                    color: "#8B0000",
                    lineHeight: "1",
                  }}
                >
                  {setsCompleted}
                </div>
                <div
                  style={{
                    fontFamily: '"Libre Baskerville", serif',
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "#5C4033",
                    marginTop: "4px",
                  }}
                >
                  TOTAL SETS
                </div>
              </div>
            </div>
          </div>

          {/* Bottom motto */}
          <div className="mt-2 text-center">
            <div
              style={{
                fontFamily: '"Libre Baskerville", serif',
                fontStyle: "italic",
                fontSize: "11px",
                color: "#5C4033",
                letterSpacing: "0.05em",
              }}
            >
              "Iron sharpens iron, push by push"
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
