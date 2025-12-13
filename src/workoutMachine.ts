import { setup, assign } from 'xstate';

// --- Types ---
export interface WorkoutContext {
  peakReps: number;
  pyramidSets: number[];
  currentSetIndex: number;
  completedRepsInSet: number;
  tempoMs: number;
  isMuted: boolean;
}

export type WorkoutEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SKIP_REST' }
  | { type: 'SET_PEAK'; peak: number }
  | { type: 'SET_TEMPO'; tempoMs: number }
  | { type: 'TOGGLE_MUTE' };

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

// --- Machine Setup ---
export const workoutMachine = setup({
  types: {} as {
    context: WorkoutContext;
    events: WorkoutEvent;
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
    }),
    toggleMute: assign({
      isMuted: ({ context }) => !context.isMuted,
    }),
    // Sound actions - these will be overridden by the component
    playDown: () => {},
    playUp: () => {},
    playLastDown: () => {},
    playLastUp: () => {},
    playGo: () => {},
    playRest: () => {},
    playFinish: () => {},
  },
  guards: {
    hasMoreReps: ({ context }) => {
      const target = context.pyramidSets[context.currentSetIndex];
      return context.completedRepsInSet < target;
    },
    // Check if the NEXT down will be the last rep (after current up increments)
    isNextRepLast: ({ context }) => {
      const target = context.pyramidSets[context.currentSetIndex];
      // After incrementing in UP, completedRepsInSet will equal target-1 for the last rep
      return context.completedRepsInSet === target - 1;
    },
    // Check if this is a single-rep set (starts as last rep)
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
  },
  delays: {
    COUNTDOWN_DELAY: 3000,
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
  },
  on: {
    TOGGLE_MUTE: {
      actions: 'toggleMute',
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
          target: 'countdown',
          actions: 'resetWorkout',
        },
      },
    },

    countdown: {
      after: {
        COUNTDOWN_DELAY: {
          target: 'working',
          actions: 'playGo', // Sound when countdown ends and work begins
        },
      },
      on: {
        PAUSE: 'paused',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },

    working: {
      initial: 'start',
      entry: 'resetForNewSet',
      on: {
        PAUSE: 'paused',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
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
          entry: 'playDown',
          after: {
            PHASE_DELAY: 'up',
          },
        },
        up: {
          entry: ['incrementRep', 'playUp'],
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
                target: '#workout.setComplete',
              },
            ],
          },
        },
        lastDown: {
          entry: 'playLastDown',
          after: {
            PHASE_DELAY: 'lastUp',
          },
        },
        lastUp: {
          entry: ['incrementRep', 'playLastUp'],
          after: {
            PHASE_DELAY: '#workout.setComplete',
          },
        },
      },
    },

    setComplete: {
      always: [
        {
          guard: 'isWorkoutComplete',
          target: 'finished',
        },
        {
          target: 'resting',
        },
      ],
    },

    resting: {
      entry: 'playRest', // Sound when rest begins
      after: {
        REST_DELAY: {
          target: 'countdown',
          actions: 'advanceToNextSet',
        },
      },
      on: {
        SKIP_REST: {
          target: 'countdown',
          actions: 'advanceToNextSet',
        },
        PAUSE: 'paused',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },

    paused: {
      on: {
        RESUME: 'countdown',
        RESET: {
          target: 'idle',
          actions: 'resetWorkout',
        },
      },
    },

    finished: {
      entry: 'playFinish', // Sound when workout complete
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
  // Sum of all completed sets
  const completedSets = context.pyramidSets.slice(0, context.currentSetIndex);
  const completedSetsVolume = completedSets.reduce((a, b) => a + b, 0);
  // Plus reps done in current set
  return completedSetsVolume + context.completedRepsInSet;
};

export const selectProgressPercent = (context: WorkoutContext): number => {
  return (context.currentSetIndex / context.pyramidSets.length) * 100;
};
