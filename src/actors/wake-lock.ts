import { fromCallback } from "xstate";

/**
 * Wake Lock Actor
 * Automatically acquires wake lock when invoked (entering active state)
 * and releases it when the parent state exits.
 */
export const wakeLockActor = fromCallback(() => {
  if (!("wakeLock" in navigator)) {
    return;
  }

  let sentinel: WakeLockSentinel | null = null;

  // Acquire wake lock
  const acquireLock = async () => {
    try {
      sentinel = await navigator.wakeLock.request("screen");
      console.log("Wake Lock acquired");
    } catch (err) {
      console.error("Wake Lock failed:", err);
    }
  };

  // Re-acquire on visibility change (browser releases lock when tab is hidden)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && !sentinel) {
      acquireLock();
    }
  };

  acquireLock();
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function: runs automatically when the parent state is exited
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    sentinel?.release();
    console.log("Wake Lock released");
  };
});
