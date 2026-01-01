import { Platform } from "react-native";

// Apple Health integration for iOS
// Saves workout as "Functional Strength Training" with push-up count

// Dynamic import to avoid crash on non-iOS platforms
// biome-ignore lint/suspicious/noExplicitAny: dynamic require for platform-specific module
let AppleHealthKit: any = null;

if (Platform.OS === "ios") {
  try {
    AppleHealthKit = require("react-native-health").default;
  } catch {
    console.log("Apple Health not available");
  }
}

const HEALTH_PERMISSIONS = {
  permissions: {
    read: [],
    write: ["Workout"],
  },
};

export async function initHealthKit(): Promise<boolean> {
  if (!AppleHealthKit) return false;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(HEALTH_PERMISSIONS, (error: string) => {
      if (error) {
        console.log("HealthKit init error:", error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function saveWorkout(
  totalReps: number,
  durationMs: number
): Promise<boolean> {
  if (!AppleHealthKit) return false;

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - durationMs);

  return new Promise((resolve) => {
    AppleHealthKit.saveWorkout(
      {
        type: "FunctionalStrengthTraining", // Maps to HKWorkoutActivityType
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (error: string | null, result: unknown) => {
        if (error) {
          console.log("saveWorkout error:", error);
          resolve(false);
        } else {
          console.log(`Workout saved to Apple Health: ${totalReps} reps`, result);
          resolve(true);
        }
      }
    );
  });
}

export function isHealthAvailable(): boolean {
  return Platform.OS === "ios" && AppleHealthKit !== null;
}
