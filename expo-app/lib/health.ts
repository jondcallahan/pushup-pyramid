import { Platform } from "react-native";
import type { HealthActivity } from "react-native-health";

// Apple Health integration for iOS
// Saves workout as "Functional Strength Training" with push-up count

let AppleHealthKit: typeof import("react-native-health").default | null = null;
let HealthActivityEnum: typeof HealthActivity | null = null;

if (Platform.OS === "ios") {
  try {
    const healthModule = require("react-native-health");
    AppleHealthKit = healthModule.default;
    HealthActivityEnum = healthModule.HealthActivity;
  } catch {
    console.log("Apple Health not available");
  }
}

const HEALTH_PERMISSIONS = {
  permissions: {
    read: [] as string[],
    write: ["Workout"] as string[],
  },
};

export async function initHealthKit(): Promise<boolean> {
  if (!AppleHealthKit) return false;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(
      HEALTH_PERMISSIONS as Parameters<typeof AppleHealthKit.initHealthKit>[0],
      (error: string) => {
        if (error) {
          console.log("HealthKit init error:", error);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
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
        type: HealthActivityEnum?.FunctionalStrengthTraining ?? ("FunctionalStrengthTraining" as unknown as HealthActivity),
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
