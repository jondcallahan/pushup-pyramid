# Testing HealthKit Fix

## What I Fixed

### The Bug
HealthKit permission prompt never appeared because `initHealthKit()` was only called AFTER a workout completed, not on app startup.

### The Fix
Added `useEffect` hook in `app.tsx` to request HealthKit permissions when app launches:

```typescript
// Request HealthKit permissions on app startup
useEffect(() => {
  if (isHealthAvailable()) {
    initHealthKit().catch((error) => {
      console.log("Failed to initialize HealthKit:", error);
    });
  }
}, []);
```

## How to Test

### 1. Clean Build
```bash
# Delete app from simulator/device
# Clean build folders
rm -rf ios/build
cd ios && pod install && cd ..
```

### 2. Rebuild & Run
```bash
npm run ios
```

### 3. Expected Behavior

**First Launch:**
- App loads
- HealthKit permission prompt appears: "Pyramid Push would like to access Health"
- Prompt shows: "Write: Workouts"
- Tap "Allow"

**During Workout:**
- Complete a workout
- Check Apple Health app → Browse → Activity → Workouts
- Should see "Functional Strength Training" entry with timestamp

**If Prompt Doesn't Appear:**
1. Delete app completely
2. Settings → Privacy → Health → Delete all Pyramid Push data
3. Rebuild from scratch
4. Sometimes simulator cache causes issues - try real device

## Verification

After fix:
- ✅ `app.json` has HealthKit entitlements
- ✅ `app.json` has NSHealthShareUsageDescription & NSHealthUpdateUsageDescription  
- ✅ `plugins` includes "react-native-health"
- ✅ `app.tsx` requests permissions on startup
- ✅ `lib/health.ts` saves workout after completion

## If Still Not Working

The `react-native-health` library requires native code linking. Since you're using Expo:

1. **Option A**: Use EAS Build (handles native dependencies automatically)
2. **Option B**: Create a development build locally:
   ```bash
   npx expo run:ios
   ```

This will rebuild the native app with all native modules properly linked.

## Alternative: Use expo-health (if exists)

Check if there's an official Expo HealthKit module:
```bash
npx expo install expo-health
```

But `react-native-health` should work fine with proper native builds.
