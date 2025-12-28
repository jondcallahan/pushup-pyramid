# iOS Live Activity Implementation for Pyramid Push

## Overview
This document describes the iOS Live Activity implementation for the Pyramid Push workout app. The Live Activity displays real-time workout progress on the iOS Lock Screen and Dynamic Island when the user switches away from the app.

## Architecture

### Components Created

#### 1. Native Expo Module (`modules/live-activity/`)
- **`ios/LiveActivityModule.swift`** - The Expo native module that bridges JavaScript to ActivityKit
  - `isAvailable()` - Check if Live Activities are enabled on the device
  - `startActivity(params)` - Start a new Live Activity
  - `updateActivity(params)` - Update the Live Activity with new state
  - `endActivity()` - End the activity with a completion state
  - `endActivityImmediately()` - End the activity immediately (for reset/cancel)

- **`ios/WorkoutActivityAttributes.swift`** - Shared ActivityAttributes struct defining:
  - Static attributes: `peakReps`, `workoutName`
  - Dynamic ContentState: `phase`, `currentSetReps`, `completedReps`, `currentSetIndex`, `totalSets`, `timerValue`, `instruction`, `completedVolume`, `totalVolume`

- **TypeScript interface** (`src/LiveActivityModule.ts`, `src/LiveActivity.types.ts`)
  - Type-safe interface for calling native functions from JavaScript
  - Web stub that no-ops gracefully

#### 2. Widget Extension (`targets/workout-widget/`)
- **`WorkoutWidget.swift`** - SwiftUI widget implementation with:
  - **Lock Screen View** - Full banner showing:
    - Phase icon and workout name
    - Large instruction text (GET READY, DOWN, UP, PUSH!, REST)
    - Timer countdown or rep counter
    - Set and volume progress
    - Progress bar
  - **Dynamic Island Views**:
    - Compact leading: Phase icon
    - Compact trailing: Timer/rep count
    - Minimal: Phase icon
    - Expanded: Full workout details with progress

- **`Attributes.swift`** - Identical copy of ActivityAttributes for widget extension
- **`expo-target.config.js`** - Widget configuration with ActivityKit framework

#### 3. React Hook (`lib/use-live-activity.ts`)
- Automatically starts Live Activity when workout begins (countdown)
- Updates on every state change (timer ticks, rep counts, phase changes)
- Shows detailed instructions: DOWN, UP, LAST ONE!, PUSH!, REST
- Ends activity after workout completion (with 5s delay to show final state)
- Cleans up on reset or unmount

## Color Theme
The Live Activity uses the same color palette as the main app:
- **Countdown (phase-countdown)**: Sky blue `#38bdf8`
- **Working (phase-working)**: Lime green `#a3e635`
- **Resting (phase-resting)**: Cyan `#22d3ee`
- **Paused**: Amber `#fbbf24`
- **Finished**: Fuchsia `#e879f9`

## Integration Points

### App.tsx Changes
```tsx
// Detect working phase for detailed instructions
const workingPhase = (() => {
  if (state.hasTag("phase-start")) return "phase-start";
  if (state.hasTag("phase-down")) return "phase-down";
  // ... etc
})();

// Live Activity hook
useLiveActivity({
  status,
  workingPhase,
  context,
  isActive: status !== "idle",
});
```

### app.json Configuration
```json
{
  "ios": {
    "infoPlist": {
      "NSSupportsLiveActivities": true
    },
    "entitlements": {
      "com.apple.security.application-groups": ["group.com.pyramidpush.app"]
    }
  },
  "plugins": [
    "expo-audio",
    "@bacons/apple-targets"
  ]
}
```

## Usage Flow

1. **User starts workout** → App sends START event
2. **Countdown begins** → `startActivity()` called, Live Activity appears
3. **During workout** → `updateActivity()` called on every:
   - Timer tick (countdown/rest)
   - Rep completion
   - Phase change (DOWN/UP/LAST ONE)
   - Set completion
4. **Workout finishes** → Final update with COMPLETE, then `endActivity()` after 5s
5. **User resets** → `endActivityImmediately()` called

## Testing

To test the Live Activity:
1. Run `npx expo run:ios` to build and install on simulator/device
2. Start a workout in the app
3. Swipe up to go home or lock the device
4. The Live Activity should appear on the Lock Screen and Dynamic Island

**Note**: Live Activities work best on physical iOS devices with Dynamic Island (iPhone 14 Pro and later). The simulator shows the Lock Screen presentation.

## Requirements
- iOS 16.1+ for Live Activities
- Expo SDK 54
- `@bacons/apple-targets` plugin
- Physical device recommended for full Dynamic Island experience
