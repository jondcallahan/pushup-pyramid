/**
 * Static screenshot version of the app for Remotion
 * Renders the UI with hardcoded state (no XState machine)
 */

import { Play, Trophy } from "lucide-react";

type ScreenState = "idle" | "working" | "rest" | "finished";

interface ScreenshotAppProps {
  screenState: ScreenState;
  marketingText?: string;
}

const stateConfigs: Record<
  ScreenState,
  {
    strokeColor: string;
    mainContent: React.ReactNode;
    subText: string;
    currentReps: number;
    completedVolume: number;
    totalVolume: number;
    pyramidHighlight: number;
    progressPercent: number;
  }
> = {
  idle: {
    strokeColor: "text-zinc-600",
    mainContent: <Play className="h-16 w-16 text-lime-400" />,
    subText: "Tap to Start",
    currentReps: 0,
    completedVolume: 0,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 0,
  },
  working: {
    strokeColor: "text-lime-400",
    mainContent: <span className="font-black text-8xl text-white">10</span>,
    subText: "5 / 10 reps",
    currentReps: 10,
    completedVolume: 35,
    totalVolume: 100,
    pyramidHighlight: 4,
    progressPercent: 35,
  },
  rest: {
    strokeColor: "text-cyan-400",
    mainContent: <span className="font-black text-7xl text-white">12s</span>,
    subText: "REST & RECOVER",
    currentReps: 0,
    completedVolume: 45,
    totalVolume: 100,
    pyramidHighlight: 5,
    progressPercent: 45,
  },
  finished: {
    strokeColor: "text-fuchsia-400",
    mainContent: <Trophy className="h-16 w-16 text-yellow-400" />,
    subText: "GREAT JOB!",
    currentReps: 0,
    completedVolume: 100,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 100,
  },
};

export const ScreenshotApp = ({
  screenState,
  marketingText,
}: ScreenshotAppProps) => {
  const config = stateConfigs[screenState];
  const pyramidSets = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  ];
  const peakReps = 10;

  // SVG circle config
  const size = 300;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = config.progressPercent / 100;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {/* Circular Progress */}
        <div className="relative mb-8">
          <svg className="-rotate-90 transform" height={size} width={size}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              stroke="#27272a"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              className={config.strokeColor}
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress * circumference}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {config.mainContent}
          </div>
        </div>

        {/* Status text */}
        <div className="mb-8 text-2xl text-zinc-400">{config.subText}</div>

        {/* Pyramid visualization */}
        <div className="mb-8 flex h-16 items-end justify-center gap-1">
          {pyramidSets.map((reps, index) => {
            const heightPercent = (reps / peakReps) * 100;
            const isCompleted = index < config.pyramidHighlight;
            const isCurrent = index === config.pyramidHighlight;

            return (
              <div
                className={`w-3 rounded-t transition-all duration-300 ${
                  isCurrent
                    ? "bg-lime-400"
                    : isCompleted
                      ? "bg-lime-600"
                      : "bg-zinc-700"
                }`}
                key={index}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-16 text-center">
          <div>
            <div className="font-bold text-4xl">
              {config.currentReps || "—"}
            </div>
            <div className="text-sm text-zinc-500">REPS</div>
          </div>
          <div>
            <div className="font-bold text-4xl">
              {config.completedVolume} / {config.totalVolume}
            </div>
            <div className="text-sm text-zinc-500">VOLUME</div>
          </div>
        </div>

        {/* Marketing text overlay */}
        {marketingText && (
          <div className="mt-12 font-bold text-2xl text-lime-400 uppercase tracking-wider">
            {marketingText}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotApp;
