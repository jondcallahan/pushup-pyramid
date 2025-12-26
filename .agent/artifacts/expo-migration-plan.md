# Expo Migration Plan: Pushup Pyramid

## Overview

Migrate the current Vite/React web app to **Expo with React Native Web** for a unified codebase targeting:
- 📱 iOS (App Store, $2.99-$4.99)
- 📱 Android (Play Store)
- 🌐 Web (Free tier)

## Current Architecture

```
src/
├── App.tsx              # Main UI (React + Tailwind)
├── workout-machine.ts   # XState state machine ✅ Portable
├── actors/
│   └── audio.ts         # Web Audio API ⚠️ Needs native replacement
├── components/
│   ├── share-modal.tsx
│   ├── audio-preview-modal.tsx
│   └── ...
└── index.css            # Tailwind styles
```

## Target Architecture

```
pushup-pyramid/
├── app/                     # Expo Router (file-based routing)
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Home/workout screen
│   └── settings.tsx         # Settings modal (optional route)
├── components/
│   ├── WorkoutCircle.tsx    # SVG progress circle
│   ├── PyramidBars.tsx      # Visualization bars
│   ├── StatsRow.tsx         # Set/Volume/Next cards
│   ├── ControlButtons.tsx   # Skip/Pause/Resume
│   └── ShareModal.tsx       # Share result
├── lib/
│   ├── workout-machine.ts   # XState machine (unchanged!)
│   ├── audio.ts             # Platform audio abstraction
│   ├── audio.native.ts      # Native audio (expo-av)
│   ├── audio.web.ts         # Web Audio API
│   └── haptics.ts           # Haptic feedback
├── assets/
│   └── sounds/              # Pre-generated beep files
├── app.json                 # Expo config
├── tailwind.config.js       # NativeWind config
└── package.json
```

---

## Phase 1: Project Setup

### 1.1 Create Expo Project
```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest pushup-pyramid-expo --template blank-typescript

# Or convert existing (keep git history)
npx expo init --yes
```

### 1.2 Install Dependencies
```bash
# Core
npx expo install expo-router expo-av expo-haptics react-native-svg

# Styling (NativeWind = Tailwind for React Native)
npm install nativewind tailwindcss
npx pod-install # iOS

# State management (same as web!)
npm install xstate @xstate/react

# Icons
npm install lucide-react-native react-native-svg

# Web support
npx expo install react-native-web react-dom
```

### 1.3 Configure NativeWind
```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        zinc: { /* your existing palette */ }
      }
    }
  }
}
```

---

## Phase 2: Core Logic Migration

### 2.1 XState Machine (No changes needed! ✅)
The `workout-machine.ts` is pure TypeScript with no DOM dependencies. 
Copy directly to `lib/workout-machine.ts`.

### 2.2 Platform-Agnostic Audio Interface
```typescript
// lib/audio.ts - Shared interface
export interface AudioPlayer {
  playDown(): void;
  playUp(): void;
  playLastDown(): void;
  playLastUp(): void;
  playGo(): void;
  playRest(): void;
  playFinish(): void;
  playCountdownBeep(): void;
  setMuted(muted: boolean): void;
}
```

### 2.3 Native Audio Implementation (expo-av)
```typescript
// lib/audio.native.ts
import { Audio } from 'expo-av';

// Use pre-recorded sounds for reliability
const sounds = {
  down: require('../assets/sounds/down.mp3'),
  up: require('../assets/sounds/up.mp3'),
  // ... etc
};

export const createAudioPlayer = (): AudioPlayer => {
  let isMuted = false;
  
  const play = async (sound: keyof typeof sounds) => {
    if (isMuted) return;
    const { sound: audio } = await Audio.Sound.createAsync(sounds[sound]);
    await audio.playAsync();
  };
  
  return {
    playDown: () => play('down'),
    // ... etc
  };
};
```

### 2.4 Web Audio Implementation
```typescript
// lib/audio.web.ts
// Keep existing Web Audio API logic
export const createAudioPlayer = (): AudioPlayer => {
  // Existing oscillator-based implementation
};
```

---

## Phase 3: Component Migration

### 3.1 Translation Guide

| Web (React) | React Native |
|-------------|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<button>` | `<Pressable>` or `<TouchableOpacity>` |
| `<svg>` | `react-native-svg` components |
| `className="..."` | `className="..."` (NativeWind) |
| `onClick` | `onPress` |
| `hover:` states | Platform-specific handling |

### 3.2 Main App Component Conversion

**Before (Web):**
```tsx
<div className="flex min-h-screen flex-col bg-zinc-950">
  <button onClick={handleClick}>
    <span className="text-6xl">{count}</span>
  </button>
</div>
```

**After (React Native):**
```tsx
<View className="flex-1 bg-zinc-950">
  <Pressable onPress={handleClick}>
    <Text className="text-6xl">{count}</Text>
  </Pressable>
</View>
```

### 3.3 SVG Circle Migration
```tsx
// components/WorkoutCircle.tsx
import Svg, { Circle } from 'react-native-svg';

export const WorkoutCircle = ({ progress, size = 300 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#18181b"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#84cc16"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
};
```

---

## Phase 4: Platform-Specific Features

### 4.1 Haptic Feedback (iOS/Android)
```typescript
// lib/haptics.ts
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  repDown: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  repUp: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  finished: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }
};
```

### 4.2 Live Activity (iOS 16+)

**Option A: Use existing library**
```bash
npm install react-native-live-activity
```

**Option B: Custom Expo Config Plugin**

This requires a native Swift widget. The Live Activity would show:
- Current rest time countdown
- Current set info (e.g., "Set 5: 8 reps")
- Progress indicator

```swift
// ios/LiveActivity/PushupWidgetLiveActivity.swift
struct PushupAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var restTimeRemaining: Int
        var currentSet: Int
        var currentReps: Int
    }
    var totalSets: Int
}
```

### 4.3 Background Audio
```typescript
// Configure audio session for background playback
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});
```

---

## Phase 5: Styling with NativeWind

### 5.1 Global Styles
```typescript
// global.css (imported in _layout.tsx)
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.2 Custom Theme
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['GeistMono', 'monospace'], // Load custom fonts
      },
      colors: {
        zinc: {
          950: '#09090b',
          900: '#18181b',
          800: '#27272a',
          // ... etc
        }
      }
    }
  }
}
```

---

## Phase 6: App Store Preparation

### 6.1 App Configuration
```json
// app.json
{
  "expo": {
    "name": "Pyramid Push",
    "slug": "pyramid-push",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.yourname.pyramidpush",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "package": "com.yourname.pyramidpush",
      "versionCode": 1
    }
  }
}
```

### 6.2 Build Commands
```bash
# Development
npx expo start

# iOS build
eas build --platform ios

# Android build
eas build --platform android

# Web build
npx expo export:web
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Initialize Expo project
- [ ] Install dependencies
- [ ] Configure NativeWind
- [ ] Set up Expo Router

### Phase 2: Core Logic
- [ ] Copy workout-machine.ts
- [ ] Create audio abstraction
- [ ] Implement native audio player
- [ ] Keep web audio player

### Phase 3: Components
- [ ] Convert App.tsx → app/index.tsx
- [ ] Convert header component
- [ ] Convert stats row
- [ ] Convert SVG circle
- [ ] Convert pyramid bars
- [ ] Convert control buttons
- [ ] Convert settings modal
- [ ] Convert share modal

### Phase 4: Native Features
- [ ] Add haptic feedback
- [ ] Configure background audio
- [ ] Implement Live Activity (iOS)
- [ ] Test on physical devices

### Phase 5: Polish
- [ ] Load custom fonts (Geist)
- [ ] Add app icons
- [ ] Add splash screen
- [ ] Test all platforms

### Phase 6: Deploy
- [ ] Configure EAS Build
- [ ] Submit to App Store
- [ ] Submit to Play Store
- [ ] Deploy web version

---

## Estimated Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup | 2-3 hours | Project scaffolding |
| Core Logic | 1-2 hours | Mostly copy/paste |
| Components | 1-2 days | Main migration work |
| Native Features | 1 day | Haptics, audio |
| Live Activity | 1-2 days | iOS native code needed |
| Polish & Deploy | 1 day | Icons, testing, submission |

**Total: ~5-7 days** for MVP with core features

---

## Decision Points

1. **Fonts**: Use system fonts or bundle Geist?
   - Bundling adds ~200KB but maintains design
   
2. **Audio**: Oscillator synthesis vs. pre-recorded sounds?
   - Pre-recorded is more reliable on mobile
   - Oscillators give you the current sound design
   
3. **Live Activity**: Essential for v1 or future feature?
   - Significant iOS-specific work
   - Could be v1.1 feature

4. **Pricing**: 
   - Web: Free
   - iOS/Android: $2.99 one-time
   - Alternative: Free with ads, $2.99 to remove
