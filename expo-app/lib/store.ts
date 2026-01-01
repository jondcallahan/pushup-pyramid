import { Platform } from "react-native";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

const STORAGE_KEY = "pyramid-push-storage";

// Cross-platform storage adapter
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(name);
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(name, value);
        return;
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(name);
        return;
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem(name);
    } catch (e) {
      console.error("Failed to remove state:", e);
    }
  },
};

interface AppState {
  hasSeenOnboarding: boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (): AppState => ({
      hasSeenOnboarding: false,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
    }
  )
);
