import { fromCallback } from "xstate";

/**
 * Wake Lock Actor
 * Automatically acquires wake lock when invoked (entering active state)
 * and releases it when the parent state exits.
 *
 * Uses the Screen Wake Lock API when available (web browsers).
 * On React Native, this would need to be replaced with expo-keep-awake.
 */
export const wakeLockActor = fromCallback(() => {
  // Check if we're in a browser environment with wake lock support
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
