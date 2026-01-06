const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  name: IS_DEV ? "Pyramid Push (Dev)" : "Pyramid Push",
  slug: "pyramid-push",
  version: "1.0.0",
  orientation: "portrait",
  icon: IS_DEV ? "./assets/icon-dev-1024.png" : "./assets/icon-1024.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#09090b"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? "com.pyramidpush.app.dev" : "com.pyramidpush.app",
    entitlements: {
      "com.apple.developer.healthkit": true
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#09090b"
    },
    edgeToEdgeEnabled: true,
    package: IS_DEV ? "com.pyramidpush.app.dev" : "com.pyramidpush.app"
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
    output: "single",
    backgroundColor: "#09090b"
  },
  plugins: [
    "expo-audio",
    [
      "@kingstinct/react-native-healthkit",
      {
        NSHealthShareUsageDescription: "Pyramid Push syncs your workouts to Apple Health.",
        NSHealthUpdateUsageDescription: "Pyramid Push saves your workouts to Apple Health."
      }
    ]
  ]
};
