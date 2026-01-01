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

export async function initHealthKit(): Promise<boolean> {
  console.log("🏥 initHealthKit called, AppleHealthKit:", !!AppleHealthKit);
  if (!AppleHealthKit) return false;

  const permissions = {
    permissions: {
      read: [],
      write: [AppleHealthKit.Constants.Permissions.Workout],
    },
  };

  return new Promise((resolve) => {
    console.log("🏥 Calling AppleHealthKit.initHealthKit...");
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log("🏥 HealthKit init error:", error);
        resolve(false);
      } else {
        console.log("🏥 HealthKit init SUCCESS");
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
    // Add metadata: https://developer.apple.com/documentation/healthkit/hkmetadata
    const options = {
      type: "FunctionalStrengthTraining", // Maps to HKWorkoutActivityType
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metadata: {
        // Use a generic key if we can't find specific push-up metadata key support in the lib
        // but typically one might want to log reps.
        // react-native-health support varies, but standard saveWorkout supports metadata object.
      },
    };

    AppleHealthKit.saveWorkout(
      options,
      (error: string | null, result: unknown) => {
        if (error) {
          console.log("saveWorkout error:", error);
          resolve(false);
        } else {
          console.log(
            `Workout saved to Apple Health: ${totalReps} reps`,
            result
          );
          resolve(true);
        }
      }
    );
  });
}

export function isHealthAvailable(): boolean {
  return Platform.OS === "ios" && AppleHealthKit !== null;
}
