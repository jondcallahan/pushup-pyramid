import { setup, assign, sendTo, fromCallback } from 'xstate';
import { wakeLockActor } from './actors/wakeLock';
import { audioActor } from './actors/audio';

// --- Types ---
export interface WorkoutContext {
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
}

export type WorkoutEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SKIP_REST' }
  | { type: 'SET_PEAK'; peak: number }
  | { type: 'SET_TEMPO'; tempoMs: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'REST_TICK' };

// --- Helper Functions ---
export const generatePyramid = (peak: number): number[] => {
  const pyramid: number[] = [];
  for (let i = 1; i <= peak; i++) pyramid.push(i);
  for (let i = peak - 1; i >= 1; i--) pyramid.push(i);
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

// --- Ticker Actors (defined inline for simplicity) ---
const countdownTickerActor = fromCallback(({ sendBack }) => {
  // First tick after 1 second (entry action already showed "3" and played beep)
  const interval = setInterval(() => {
    sendBack({ type: 'COUNTDOWN_TICK' });
  }, 1000);

  return () => clearInterval(interval);
});

const restTickerActor = fromCallback(({ sendBack }) => {
  const interval = setInterval(() => {
    sendBack({ type: 'REST_TICK' });
  }, 1000);

  return () => clearInterval(interval);
});

// --- Machine Setup ---
export const workoutMachine = setup({
  types: {} as {
    context: WorkoutContext;
    events: WorkoutEvent;
  },
  actors: {
    wakeLock: wakeLockActor,
    audio: audioActor,
    countdownTicker: countdownTickerActor,
    restTicker: restTickerActor,
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
      countdownSecondsLeft: ({ context }) => Math.max(0, context.countdownSecondsLeft - 1),
    }),
    // Rest timer actions
    initRest: assign(({ context }) => {
      const duration = calculateRestSeconds(context.pyramidSets[context.currentSetIndex]);
      return {
        restSecondsLeft: duration,
        timerStartedAt: Date.now(),
        timerDuration: duration * 1000,
      };
    }),
    decrementRest: assign({
      restSecondsLeft: ({ context }) => Math.max(0, context.restSecondsLeft - 1),
    }),
    // Audio actions - send to spawned audio actor
    sendPlayDown: sendTo('audioActor', { type: 'PLAY_DOWN' }),
    sendPlayUp: sendTo('audioActor', { type: 'PLAY_UP' }),
    sendPlayLastDown: sendTo('audioActor', { type: 'PLAY_LAST_DOWN' }),
    sendPlayLastUp: sendTo('audioActor', { type: 'PLAY_LAST_UP' }),
    sendPlayGo: sendTo('audioActor', { type: 'PLAY_GO' }),
    sendPlayRest: sendTo('audioActor', { type: 'PLAY_REST' }),
    sendPlayFinish: sendTo('audioActor', { type: 'PLAY_FINISH' }),
    sendPlayCountdownBeep: sendTo('audioActor', { type: 'PLAY_COUNTDOWN_BEEP' }),
    syncMuteState: sendTo('audioActor', ({ context }) => ({
      type: 'SET_MUTED' as const,
      muted: context.isMuted
    })),
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
    hasMoreSets: ({ context }) => {
      return context.currentSetIndex < context.pyramidSets.length - 1;
    },
    isWorkoutComplete: ({ context }) => {
      return context.currentSetIndex >= context.pyramidSets.length - 1;
    },
    countdownComplete: ({ context }) => context.countdownSecondsLeft <= 0,
    restComplete: ({ context }) => context.restSecondsLeft <= 0,
  },
  delays: {
    REST_DELAY: ({ context }) => calculateRestTime(context.pyramidSets[context.currentSetIndex]),
    PHASE_DELAY: ({ context }) => context.tempoMs / 2,
    INITIAL_DELAY: 600,
  },
}).createMachine({
  id: 'workout',
  initial: 'idle',
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
  invoke: [
    { id: 'audioActor', src: 'audio' },
  ],
  on: {
    TOGGLE_MUTE: {
      actions: ['toggleMute', 'syncMuteState'],
    },
    SET_PEAK: {
      target: '.idle',
      actions: [
        assign({
          pyramidSets: ({ event }) => generatePyramid(event.peak),
          peakReps: ({ event }) => event.peak,
          currentSetIndex: 0,
          completedRepsInSet: 0,
        }),
      ],
    },
    SET_TEMPO: {
      actions: assign({
        tempoMs: ({ event }) => event.tempoMs,
      }),
    },
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'active',
          actions: 'resetWorkout',
        },
      },
    },

    // Active state - wraps all workout activity
    active: {
      // Wake lock - automatically acquired/released with active state
      invoke: { id: 'wakeLock', src: 'wakeLock' },
      initial: 'countdown',
      on: {
        PAUSE: 'paused',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
      states: {
        countdown: {
          entry: ['initCountdown', 'sendPlayCountdownBeep'],
          invoke: {
            src: 'countdownTicker',
          },
          on: {
            COUNTDOWN_TICK: [
              {
                guard: 'countdownComplete',
                target: 'working',
                actions: ['resetForNewSet', 'sendPlayGo'],
              },
              {
                actions: ['decrementCountdown', 'sendPlayCountdownBeep'],
              },
            ],
          },
        },

        working: {
          initial: 'start',
          states: {
            start: {
              after: {
                INITIAL_DELAY: [
                  {
                    guard: 'isSingleRepSet',
                    target: 'lastDown',
                  },
                  {
                    target: 'down',
                  },
                ],
              },
            },
            down: {
              entry: 'sendPlayDown',
              after: {
                PHASE_DELAY: {
                  target: 'up',
                  actions: 'incrementRep',
                },
              },
            },
            up: {
              entry: 'sendPlayUp',
              after: {
                PHASE_DELAY: [
                  {
                    guard: 'isNextRepLast',
                    target: 'lastDown',
                  },
                  {
                    guard: 'hasMoreReps',
                    target: 'down',
                  },
                  {
                    target: '#workout.active.setComplete',
                  },
                ],
              },
            },
            lastDown: {
              entry: 'sendPlayLastDown',
              after: {
                PHASE_DELAY: {
                  target: 'lastUp',
                  actions: 'incrementRep',
                },
              },
            },
            lastUp: {
              entry: 'sendPlayLastUp',
              after: {
                PHASE_DELAY: '#workout.active.setComplete',
              },
            },
          },
        },

        setComplete: {
          always: [
            {
              guard: 'isWorkoutComplete',
              target: '#workout.finished',
            },
            {
              target: 'resting',
            },
          ],
        },

        resting: {
          entry: ['initRest', 'sendPlayRest'],
          invoke: {
            src: 'restTicker',
          },
          on: {
            REST_TICK: [
              {
                guard: 'restComplete',
                target: 'countdown',
                actions: 'advanceToNextSet',
              },
              {
                actions: 'decrementRest',
              },
            ],
            SKIP_REST: {
              target: 'countdown',
              actions: 'advanceToNextSet',
            },
          },
        },

        // Deep history pseudo-state to remember position within active
        hist: {
          type: 'history',
          history: 'deep',
        },
      },
    },

    paused: {
      on: {
        RESUME: '#workout.active.hist',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },

    finished: {
      entry: 'sendPlayFinish',
      on: {
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },
  },
});

// --- Selectors ---
export const selectCurrentTargetReps = (context: WorkoutContext): number => {
  return context.pyramidSets[context.currentSetIndex] ?? 0;
};

export const selectNextSetReps = (context: WorkoutContext): number | null => {
  return context.pyramidSets[context.currentSetIndex + 1] ?? null;
};

export const selectTotalVolume = (context: WorkoutContext): number => {
  return context.pyramidSets.reduce((a, b) => a + b, 0);
};

export const selectCompletedVolume = (context: WorkoutContext): number => {
  const completedSets = context.pyramidSets.slice(0, context.currentSetIndex);
  const completedSetsVolume = completedSets.reduce((a, b) => a + b, 0);
  return completedSetsVolume + context.completedRepsInSet;
};

export const selectProgressPercent = (context: WorkoutContext): number => {
  return (context.currentSetIndex / context.pyramidSets.length) * 100;
};

// New selectors for timer state
export const selectCountdownSeconds = (context: WorkoutContext): number => {
  return context.countdownSecondsLeft;
};

export const selectRestSeconds = (context: WorkoutContext): number => {
  return context.restSecondsLeft;
};
