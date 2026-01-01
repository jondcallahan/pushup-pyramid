#!/bin/bash
set -e

echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf node_modules/.cache

echo "📦 Reinstalling iOS dependencies..."
cd ios
pod install
cd ..

echo "🔨 Building native app..."
npx expo run:ios --device

echo "✅ Done! App should launch with HealthKit prompt."
