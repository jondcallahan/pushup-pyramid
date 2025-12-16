import type { RefObject } from "react";

type ShareCardProps = {
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
  date: Date;
  ref?: RefObject<HTMLDivElement | null>;
};

const ShareCard = ({
  totalVolume,
  peakReps,
  setsCompleted,
  date,
  ref,
}: ShareCardProps) => {
  const formattedDate = date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  // Rank based on volume
  const getRank = () => {
    if (totalVolume >= 200) {
      return { title: "HEAVYWEIGHT", stars: 5 };
    }
    if (totalVolume >= 150) {
      return { title: "CRUISERWEIGHT", stars: 4 };
    }
    if (totalVolume >= 100) {
      return { title: "MIDDLEWEIGHT", stars: 3 };
    }
    if (totalVolume >= 50) {
      return { title: "WELTERWEIGHT", stars: 2 };
    }
    return { title: "FEATHERWEIGHT", stars: 1 };
  };

  const rank = getRank();

  return (
    <div
      className="relative h-[520px] w-[390px] overflow-hidden"
      ref={ref}
      style={{
        background: "#1a1814",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Worn paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal corner cuts */}
      <div
        className="absolute top-0 right-0 h-20 w-20"
        style={{
          background: "linear-gradient(135deg, transparent 50%, #c9362c 50%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-20 w-20"
        style={{
          background: "linear-gradient(-45deg, transparent 50%, #c9362c 50%)",
        }}
      />

      {/* Main border */}
      <div className="absolute inset-3 border-2 border-[#c9362c]" />
      <div className="absolute inset-4 border border-[#c9362c]/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-7">
        {/* Top banner */}
        <div className="mb-2 text-center">
          <div
            className="inline-block bg-[#c9362c] px-6 py-1 font-black text-[#1a1814] text-[10px] tracking-[0.4em]"
            style={{
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            OFFICIAL RECORD
          </div>
        </div>

        {/* Date */}
        <div className="mb-4 text-center text-[#8b8579] text-[10px] tracking-[0.3em]">
          {formattedDate}
        </div>

        {/* Main title */}
        <div className="mb-1 text-center">
          <h1
            className="text-5xl text-[#f5f0e8] leading-none tracking-tight"
            style={{
              fontFamily: "Impact, Haettenschweiler, sans-serif",
              textShadow: "3px 3px 0 #c9362c",
            }}
          >
            PYRAMID
          </h1>
          <h2
            className="-mt-1 text-3xl text-[#c9362c] tracking-[0.2em]"
            style={{ fontFamily: "Impact, Haettenschweiler, sans-serif" }}
          >
            PUSH
          </h2>
        </div>

        {/* Decorative line */}
        <div className="my-3 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#c9362c]" />
          <div className="h-2 w-2 rotate-45 border border-[#c9362c]" />
          <div className="h-px w-12 bg-[#c9362c]" />
        </div>

        {/* THE BIG NUMBER */}
        <div className="-mt-2 flex flex-1 flex-col items-center justify-center">
          <div className="mb-1 text-[#8b8579] text-xs tracking-[0.5em]">
            TOTAL REPS
          </div>
          <div className="relative">
            <span
              className="font-black text-[#f5f0e8] text-[120px] leading-none"
              style={{
                fontFamily: "Impact, Haettenschweiler, sans-serif",
                textShadow: "4px 4px 0 #c9362c, 8px 8px 0 rgba(0,0,0,0.3)",
                letterSpacing: "-0.02em",
              }}
            >
              {totalVolume}
            </span>
          </div>

          {/* Rank badge */}
          <div className="mt-2 flex flex-col items-center">
            <div className="mb-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  className={`text-lg ${star <= rank.stars ? "text-[#c9362c]" : "text-[#3d3a35]"}`}
                  key={`star-${star}`}
                >
                  ★
                </span>
              ))}
            </div>
            <div
              className="text-[#f5f0e8] text-sm tracking-[0.3em]"
              style={{ fontFamily: "Impact, Haettenschweiler, sans-serif" }}
            >
              {rank.title}
            </div>
          </div>
        </div>

        {/* Stats row - fight card style */}
        <div className="my-2 border-[#c9362c]/50 border-t border-b py-4">
          <div className="flex justify-around text-center">
            <div>
              <div
                className="text-3xl text-[#f5f0e8]"
                style={{ fontFamily: "Impact, Haettenschweiler, sans-serif" }}
              >
                {peakReps}
              </div>
              <div className="mt-1 text-[#8b8579] text-[9px] tracking-[0.2em]">
                PEAK
              </div>
            </div>
            <div className="w-px bg-[#c9362c]/30" />
            <div>
              <div
                className="text-3xl text-[#f5f0e8]"
                style={{ fontFamily: "Impact, Haettenschweiler, sans-serif" }}
              >
                {setsCompleted}
              </div>
              <div className="mt-1 text-[#8b8579] text-[9px] tracking-[0.2em]">
                SETS
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-2 text-center">
          <div className="text-[#8b8579] text-[10px] tracking-[0.4em]">
            NO EXCUSES • NO SHORTCUTS • NO QUIT
          </div>
        </div>
      </div>
    </div>
  );
};

ShareCard.displayName = "ShareCard";

export default ShareCard;
