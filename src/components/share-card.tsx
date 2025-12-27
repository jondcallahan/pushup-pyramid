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
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Rank based on volume - keeping the logic but styling it cleanly
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
      className="relative flex h-[520px] w-[390px] flex-col items-center justify-between overflow-hidden bg-zinc-950 p-8 font-sans text-zinc-100"
      ref={ref}
      style={{
        backgroundColor: "#09090b", // zinc-950
      }}
    >
      {/* Ambient backgrounds/glows */}
      <div className="absolute top-0 left-0 h-40 w-full bg-gradient-to-b from-zinc-900 to-transparent opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-lime-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-lime-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mt-4 flex w-full flex-col items-center gap-2">
        <div className="font-medium text-xs text-zinc-500 uppercase tracking-widest">
          {formattedDate}
        </div>
        <h1 className="flex items-center gap-2 font-bold text-2xl text-white tracking-tight">
          <div className="h-2 w-2 rounded-full bg-lime-500" />
          PYRAMID PUSH
        </h1>
      </div>

      {/* Center Stats */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center">
          <span className="mb-2 font-medium text-sm text-zinc-500 uppercase tracking-wider">
            Total Volume
          </span>
          <span
            className="font-black text-9xl text-white leading-none tracking-tighter"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {totalVolume}
          </span>
        </div>

        {/* Rank Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5 text-lime-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={`star-${star}`}
                className={`text-2xl ${star <= rank.stars ? "opacity-100" : "text-zinc-800 opacity-100"}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 font-bold text-xs text-zinc-300 uppercase tracking-widest">
            {rank.title}
          </span>
        </div>
      </div>

      {/* Footer Stats Grid */}
      <div className="relative z-10 mb-4 grid w-full grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md">
          <span className="mb-1 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
            Peak Reps
          </span>
          <span className="font-bold text-3xl text-white">{peakReps}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-md">
          <span className="mb-1 font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
            Sets Done
          </span>
          <span className="font-bold text-3xl text-white">{setsCompleted}</span>
        </div>
      </div>
    </div>
  );
};

ShareCard.displayName = "ShareCard";

export default ShareCard;
