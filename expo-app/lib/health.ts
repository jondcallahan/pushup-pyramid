import {
  isHealthDataAvailable,
  requestAuthorization,
  saveWorkoutSample,
  WorkoutActivityType,
} from "@kingstinct/react-native-healthkit";

const CALORIES_PER_PUSHUP = 0.36;

export async function initHealthKit(): Promise<boolean> {
  const available = await isHealthDataAvailable();
  if (!available) {
    return false;
  }

  return await requestAuthorization({
    toShare: [
      "HKQuantityTypeIdentifierActiveEnergyBurned",
      "HKWorkoutTypeIdentifier",
    ],
  });
}

export async function saveWorkoutToHealth(
  totalReps: number,
  durationMs: number
): Promise<boolean> {
  const now = new Date();
  const startDate = new Date(now.getTime() - durationMs);

  try {
    const caloriesBurned = totalReps * CALORIES_PER_PUSHUP;

    await saveWorkoutSample(
      WorkoutActivityType.functionalStrengthTraining,
      [
        {
          quantityType: "HKQuantityTypeIdentifierActiveEnergyBurned",
          quantity: caloriesBurned,
          unit: "kcal",
          startDate,
          endDate: now,
        },
      ],
      startDate,
      now,
      { energyBurned: caloriesBurned },
      { totalReps: String(totalReps) }
    );
    return true;
  } catch {
    return false;
  }
}
