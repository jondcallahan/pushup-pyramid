/**
 * Static screenshot version of the app for Remotion
 * Renders the UI with hardcoded state (no XState machine)
 */

import {
  Play,
  Trophy,
} from "lucide-react";

type ScreenState = "idle" | "working" | "rest" | "finished";

interface ScreenshotAppProps {
  screenState: ScreenState;
  marketingText?: string;
}

const stateConfigs: Record<ScreenState, {
  strokeColor: string;
  mainContent: React.ReactNode;
  subText: string;
  currentReps: number;
  completedVolume: number;
  totalVolume: number;
  pyramidHighlight: number;
  progressPercent: number;
}> = {
  idle: {
    strokeColor: "text-zinc-600",
    mainContent: <Play className="w-16 h-16 text-lime-400" />,
    subText: "Tap to Start",
    currentReps: 0,
    completedVolume: 0,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 0,
  },
  working: {
    strokeColor: "text-lime-400",
    mainContent: <span className="text-8xl font-black text-white">10</span>,
    subText: "5 / 10 reps",
    currentReps: 10,
    completedVolume: 35,
    totalVolume: 100,
    pyramidHighlight: 4,
    progressPercent: 35,
  },
  rest: {
    strokeColor: "text-cyan-400",
    mainContent: <span className="text-7xl font-black text-white">12s</span>,
    subText: "REST & RECOVER",
    currentReps: 0,
    completedVolume: 45,
    totalVolume: 100,
    pyramidHighlight: 5,
    progressPercent: 45,
  },
  finished: {
    strokeColor: "text-fuchsia-400",
    mainContent: <Trophy className="w-16 h-16 text-yellow-400" />,
    subText: "GREAT JOB!",
    currentReps: 0,
    completedVolume: 100,
    totalVolume: 100,
    pyramidHighlight: -1,
    progressPercent: 100,
  },
};

export const ScreenshotApp = ({ screenState, marketingText }: ScreenshotAppProps) => {
  const config = stateConfigs[screenState];
  const pyramidSets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const peakReps = 10;
  
  // SVG circle config
  const size = 300;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = config.progressPercent / 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Circular Progress */}
        <div className="relative mb-8">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className={config.strokeColor}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress * circumference}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {config.mainContent}
          </div>
        </div>

        {/* Status text */}
        <div className="text-2xl text-zinc-400 mb-8">{config.subText}</div>

        {/* Pyramid visualization */}
        <div className="flex items-end justify-center gap-1 h-16 mb-8">
          {pyramidSets.map((reps, index) => {
            const heightPercent = (reps / peakReps) * 100;
            const isCompleted = index < config.pyramidHighlight;
            const isCurrent = index === config.pyramidHighlight;
            
            return (
              <div
                key={index}
                className={`w-3 rounded-t transition-all duration-300 ${
                  isCurrent
                    ? "bg-lime-400"
                    : isCompleted
                      ? "bg-lime-600"
                      : "bg-zinc-700"
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-16 text-center">
          <div>
            <div className="text-4xl font-bold">{config.currentReps || "—"}</div>
            <div className="text-zinc-500 text-sm">REPS</div>
          </div>
          <div>
            <div className="text-4xl font-bold">
              {config.completedVolume} / {config.totalVolume}
            </div>
            <div className="text-zinc-500 text-sm">VOLUME</div>
          </div>
        </div>

        {/* Marketing text overlay */}
        {marketingText && (
          <div className="mt-12 text-lime-400 text-2xl font-bold tracking-wider uppercase">
            {marketingText}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotApp;
