import { fromCallback } from "xstate";

/**
 * Countdown Ticker Actor
 * Sends TICK events every second for countdown synchronization.
 * The machine controls state; this just provides the heartbeat.
 */
export const countdownTickerActor = fromCallback<never, { duration: number }>(
  ({ sendBack }) => {
    // Send initial tick immediately
    sendBack({ type: "COUNTDOWN_TICK" });

    const interval = setInterval(() => {
      sendBack({ type: "COUNTDOWN_TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }
);

/**
 * Rest Timer Actor
 * Similar to countdown but for rest periods.
 */
export const restTickerActor = fromCallback<never, { duration: number }>(
  ({ sendBack, input }) => {
    const startTime = Date.now();
    const duration = input.duration;

    // Send initial state
    sendBack({ type: "REST_TICK", remaining: duration });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      sendBack({ type: "REST_TICK", remaining: Math.ceil(remaining / 1000) });
    }, 100); // More frequent for smooth UI

    return () => clearInterval(interval);
  }
);
