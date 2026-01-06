import { fromCallback } from "xstate";
import { Platform } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

/**
 * Wake Lock Actor
 * Automatically acquires wake lock when invoked (entering active state)
 * and releases it when the parent state exits.
 *
 * Uses expo-keep-awake on native platforms.
 * Uses the Screen Wake Lock API on web browsers.
 */
export const wakeLockActor = fromCallback(() => {
  // Native platforms: use expo-keep-awake
  if (Platform.OS !== "web") {
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      deactivateKeepAwake();
    };
  }

  // Web: use Screen Wake Lock API
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
    return;
  }

  let sentinel: WakeLockSentinel | null = null;

  // Acquire wake lock
  const acquireLock = async () => {
    try {
      sentinel = await navigator.wakeLock.request("screen");
    } catch {
      // Wake lock not supported or failed
    }
  };

  // Re-acquire on visibility change (browser releases lock when tab is hidden)
  const handleVisibilityChange = () => {
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "visible" &&
      !sentinel
    ) {
      acquireLock();
    }
  };

  acquireLock();

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // Cleanup function: runs automatically when the parent state is exited
  return () => {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    sentinel?.release();
  };
});
