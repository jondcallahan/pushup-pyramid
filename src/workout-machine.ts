import { assign, fromCallback, sendTo, setup } from "xstate";
import { audioActor } from "./actors/audio";
import { wakeLockActor } from "./actors/wake-lock";

// --- Types ---

// Meta types for UI configuration
export type MainContentType =
  | { type: "icon"; icon: "play" }
  | { type: "text"; text: string; className?: string }
  | { type: "countdown" }
  | { type: "rest" }
  | { type: "trophy" };

export type StateMeta = {
  strokeColor: string;
  mainContent: MainContentType;
  subText: string;
};

export type WorkoutContext = {
  peakReps: number;
  pyramidSets: number[];
  currentSetIndex: number;
  completedRepsInSet: number;
  tempoMs: number;
  isMuted: boolean;
  // Timer state (owned by machine, not UI)
  countdownSecondsLeft: number;
  restSecondsLeft: number;
  // For smooth UI animation
  timerStartedAt: number;
  timerDuration: number;
};

export type WorkoutEvent =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "SKIP_REST" }
  | { type: "SET_PEAK"; peak: number }
  | { type: "SET_TEMPO"; tempoMs: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "COUNTDOWN_TICK" }
  | { type: "REST_TICK" }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" };

// --- Helper Functions ---
export const generatePyramid = (peak: number): number[] => {
  const pyramid: number[] = [];
  for (let i = 1; i <= peak; i++) {
    pyramid.push(i);
  }
  for (let i = peak - 1; i >= 1; i--) {
    pyramid.push(i);
  }
  return pyramid;
};

export const calculateRestTime = (reps: number): number => {
  const calculated = 5 + reps * 5;
  return Math.min(60, calculated) * 1000;
};

export const calculateRestSeconds = (reps: number): number => {
  const calculated = 5 + reps * 5;
  return Math.min(60, calculated);
};

type TickerInput = {
  intervalMs: number;
  eventType: "COUNTDOWN_TICK" | "REST_TICK";
};

const tickerActor = fromCallback<WorkoutEvent, TickerInput>(
  ({ sendBack, input }) => {
    const interval = setInterval(() => {
      sendBack({ type: input.eventType });
    }, input.intervalMs);

    return () => clearInterval(interval);
  }
);

// --- Machine Setup ---
export const workoutMachine = setup({
  types: {} as {
    context: WorkoutContext;
    events: WorkoutEvent;
  },
  actors: {
    wakeLock: wakeLockActor,
    audio: audioActor,
    ticker: tickerActor,
  },
  actions: {
    resetForNewSet: assign({
      completedRepsInSet: 0,
    }),
    incrementRep: assign({
      completedRepsInSet: ({ context }) => context.completedRepsInSet + 1,
    }),
    advanceToNextSet: assign({
      currentSetIndex: ({ context }) => context.currentSetIndex + 1,
      completedRepsInSet: 0,
    }),
    resetWorkout: assign({
      currentSetIndex: 0,
      completedRepsInSet: 0,
      countdownSecondsLeft: 3,
      restSecondsLeft: 0,
    }),
    toggleMute: assign({
      isMuted: ({ context }) => !context.isMuted,
    }),
    // Countdown timer actions
    initCountdown: assign({
      countdownSecondsLeft: 3,
      timerStartedAt: () => Date.now(),
      timerDuration: 3000,
    }),
    decrementCountdown: assign({
      countdownSecondsLeft: ({ context }) =>
        Math.max(0, context.countdownSecondsLeft - 1),
    }),
    // Rest timer actions
    initRest: assign(({ context }) => {
      const duration = calculateRestSeconds(
        context.pyramidSets[context.currentSetIndex]
      );
      return {
        restSecondsLeft: duration,
        timerStartedAt: Date.now(),
        timerDuration: duration * 1000,
      };
    }),
    decrementRest: assign({
      restSecondsLeft: ({ context }) =>
        Math.max(0, context.restSecondsLeft - 1),
    }),
    // Audio actions - send to spawned audio actor
    sendPlayDown: sendTo("audioActor", { type: "PLAY_DOWN" }),
    sendPlayUp: sendTo("audioActor", { type: "PLAY_UP" }),
    sendPlayLastDown: sendTo("audioActor", { type: "PLAY_LAST_DOWN" }),
    sendPlayLastUp: sendTo("audioActor", { type: "PLAY_LAST_UP" }),
    sendPlayGo: sendTo("audioActor", { type: "PLAY_GO" }),
    sendPlayRest: sendTo("audioActor", { type: "PLAY_REST" }),
    sendPlayFinish: sendTo("audioActor", { type: "PLAY_FINISH" }),
    sendPlayCountdownBeep: sendTo("audioActor", {
      type: "PLAY_COUNTDOWN_BEEP",
    }),
    syncMuteState: sendTo("audioActor", ({ context }) => ({
      type: "SET_MUTED" as const,
      muted: context.isMuted,
    })),
    setPeak: assign({
      pyramidSets: ({ event }) =>
        generatePyramid((event as { peak: number }).peak),
      peakReps: ({ event }) => (event as { peak: number }).peak,
      currentSetIndex: 0,
      completedRepsInSet: 0,
    }),
    setTempo: assign({
      tempoMs: ({ event }) => (event as { tempoMs: number }).tempoMs,
    }),
  },
  guards: {
    hasMoreReps: ({ context }) => {
      const target = context.pyramidSets[context.currentSetIndex];
      return context.completedRepsInSet < target;
    },
    isNextRepLast: ({ context }) => {
      const target = context.pyramidSets[context.currentSetIndex];
      return context.completedRepsInSet === target - 1;
    },
    isSingleRepSet: ({ context }) => {
      const target = context.pyramidSets[context.currentSetIndex];
      return target === 1;
    },
    hasMoreSets: ({ context }) =>
      context.currentSetIndex < context.pyramidSets.length - 1,
    isWorkoutComplete: ({ context }) =>
      context.currentSetIndex >= context.pyramidSets.length - 1,
    countdownComplete: ({ context }) => context.countdownSecondsLeft <= 0,
    restComplete: ({ context }) => context.restSecondsLeft <= 0,
  },
  delays: {
    REST_DELAY: ({ context }) =>
      calculateRestTime(context.pyramidSets[context.currentSetIndex]),
    PHASE_DELAY: ({ context }) => context.tempoMs / 2,
    INITIAL_DELAY: 600,
  },
}).createMachine({
  id: "workout",
  type: "parallel",
  context: {
    peakReps: 10,
    pyramidSets: generatePyramid(10),
    currentSetIndex: 0,
    completedRepsInSet: 0,
    tempoMs: 2000,
    isMuted: false,
    countdownSecondsLeft: 3,
    restSecondsLeft: 0,
    timerStartedAt: 0,
    timerDuration: 0,
  },
  // Audio actor at root level - persists across all states to avoid race conditions
  invoke: [{ id: "audioActor", src: "audio" }],
  on: {
    TOGGLE_MUTE: {
      actions: ["toggleMute", "syncMuteState"],
    },
    SET_TEMPO: {
      actions: "setTempo",
    },
  },
  states: {
    settings: {
      initial: "closed",
      states: {
        closed: {
          on: {
            OPEN_SETTINGS: "open",
          },
        },
        open: {
          on: {
            CLOSE_SETTINGS: "closed",
          },
        },
      },
    },

    exercise: {
      initial: "idle",
      states: {
        idle: {
          tags: ["idle", "configurable"],
          meta: {
            strokeColor: "text-slate-600",
            mainContent: { type: "icon", icon: "play" },
            subText: "Tap to Start",
          },
          on: {
            START: {
              target: "active",
              actions: "resetWorkout",
            },
            SET_PEAK: {
              actions: "setPeak",
            },
          },
        },

        // Active state - wraps all workout activity
        active: {
          tags: ["active"],
          // Wake lock - automatically acquired/released with active state
          invoke: { id: "wakeLock", src: "wakeLock" },
          initial: "countdown",
          on: {
            PAUSE: "paused",
            RESET: {
              target: "idle",
              actions: "resetWorkout",
            },
          },
          states: {
            countdown: {
              tags: ["countdown", "pauseable", "timer"],
              meta: {
                strokeColor: "text-sky-400",
                mainContent: { type: "countdown" },
                subText: "Get Ready",
              },
              entry: ["initCountdown", "sendPlayCountdownBeep"],
              invoke: {
                src: "ticker",
                input: {
                  intervalMs: 1000,
                  eventType: "COUNTDOWN_TICK" as const,
                },
              },
              on: {
                COUNTDOWN_TICK: [
                  {
                    guard: "countdownComplete",
                    target: "working",
                    actions: ["resetForNewSet", "sendPlayGo"],
                  },
                  {
                    actions: ["decrementCountdown", "sendPlayCountdownBeep"],
                  },
                ],
              },
            },

            working: {
              tags: ["working", "pauseable"],
              initial: "start",
              states: {
                start: {
                  tags: ["phase-start"],
                  meta: {
                    strokeColor: "text-green-500",
                    mainContent: { type: "text", text: "GO" },
                    subText: "reps",
                  },
                  after: {
                    INITIAL_DELAY: [
                      {
                        guard: "isSingleRepSet",
                        target: "lastDown",
                      },
                      {
                        target: "down",
                      },
                    ],
                  },
                },
                down: {
                  tags: ["phase-down"],
                  meta: {
                    strokeColor: "text-orange-500",
                    mainContent: { type: "text", text: "DOWN" },
                    subText: "reps",
                  },
                  entry: "sendPlayDown",
                  after: {
                    PHASE_DELAY: {
                      target: "up",
                      actions: "incrementRep",
                    },
                  },
                },
                up: {
                  tags: ["phase-up"],
                  meta: {
                    strokeColor: "text-green-500",
                    mainContent: { type: "text", text: "UP" },
                    subText: "reps",
                  },
                  entry: "sendPlayUp",
                  after: {
                    PHASE_DELAY: [
                      {
                        guard: "isNextRepLast",
                        target: "lastDown",
                      },
                      {
                        guard: "hasMoreReps",
                        target: "down",
                      },
                      {
                        target: "#workout.exercise.active.setComplete",
                      },
                    ],
                  },
                },
                lastDown: {
                  tags: ["phase-lastDown"],
                  meta: {
                    strokeColor: "text-red-500",
                    mainContent: {
                      type: "text",
                      text: "LAST\nDOWN",
                      className: "text-5xl",
                    },
                    subText: "reps",
                  },
                  entry: "sendPlayLastDown",
                  after: {
                    PHASE_DELAY: {
                      target: "lastUp",
                      actions: "incrementRep",
                    },
                  },
                },
                lastUp: {
                  tags: ["phase-lastUp"],
                  meta: {
                    strokeColor: "text-teal-500",
                    mainContent: {
                      type: "text",
                      text: "LAST\nUP",
                      className: "text-6xl",
                    },
                    subText: "reps",
                  },
                  entry: "sendPlayLastUp",
                  after: {
                    PHASE_DELAY: "#workout.exercise.active.setComplete",
                  },
                },
              },
            },

            setComplete: {
              always: [
                {
                  guard: "isWorkoutComplete",
                  target: "#workout.exercise.finished",
                },
                {
                  target: "resting",
                },
              ],
            },

            resting: {
              tags: ["resting", "skippable", "timer"],
              meta: {
                strokeColor: "text-blue-500",
                mainContent: { type: "rest" },
                subText: "Resting... Tap to Skip",
              },
              entry: ["initRest", "sendPlayRest"],
              invoke: {
                src: "ticker",
                input: { intervalMs: 1000, eventType: "REST_TICK" as const },
              },
              on: {
                REST_TICK: [
                  {
                    guard: "restComplete",
                    target: "countdown",
                    actions: "advanceToNextSet",
                  },
                  {
                    actions: "decrementRest",
                  },
                ],
                SKIP_REST: {
                  target: "countdown",
                  actions: "advanceToNextSet",
                },
              },
            },

            // Deep history pseudo-state to remember position within active
            hist: {
              type: "history",
              history: "deep",
            },
          },
        },

        paused: {
          tags: ["paused", "configurable"],
          meta: {
            strokeColor: "text-yellow-500",
            mainContent: {
              type: "text",
              text: "PAUSED",
              className: "text-4xl",
            },
            subText: "Tap to Resume",
          },
          on: {
            RESUME: "#workout.exercise.active.hist",
            RESET: {
              target: "idle",
              actions: "resetWorkout",
            },
            SET_PEAK: {
              target: "idle",
              actions: "setPeak",
            },
          },
        },

        finished: {
          tags: ["finished", "configurable"],
          meta: {
            strokeColor: "text-purple-500",
            mainContent: { type: "trophy" },
            subText: "Great Job!",
          },
          entry: "sendPlayFinish",
          on: {
            RESET: {
              target: "idle",
              actions: "resetWorkout",
            },
            SET_PEAK: {
              target: "idle",
              actions: "setPeak",
            },
          },
        },
      },
    },
  },
});

// --- Selectors ---
export const selectCurrentTargetReps = (context: WorkoutContext): number =>
  context.pyramidSets[context.currentSetIndex] ?? 0;

export const selectNextSetReps = (context: WorkoutContext): number | null =>
  context.pyramidSets[context.currentSetIndex + 1] ?? null;

export const selectTotalVolume = (context: WorkoutContext): number =>
  context.pyramidSets.reduce((a, b) => a + b, 0);

export const selectCompletedVolume = (context: WorkoutContext): number => {
  const completedSets = context.pyramidSets.slice(0, context.currentSetIndex);
  const completedSetsVolume = completedSets.reduce((a, b) => a + b, 0);
  return completedSetsVolume + context.completedRepsInSet;
};

export const selectProgressPercent = (context: WorkoutContext): number =>
  (context.currentSetIndex / context.pyramidSets.length) * 100;

// New selectors for timer state
export const selectCountdownSeconds = (context: WorkoutContext): number =>
  context.countdownSecondsLeft;

export const selectRestSeconds = (context: WorkoutContext): number =>
  context.restSecondsLeft;

const defaultMeta: StateMeta = {
  strokeColor: "text-slate-600",
  mainContent: { type: "icon", icon: "play" },
  subText: "",
};

export const selectStateMeta = (state: {
  getMeta: () => Record<string, unknown>;
}): StateMeta => {
  const metas = Object.values(state.getMeta()).filter(Boolean) as StateMeta[];
  return metas.at(-1) ?? defaultMeta;
};
