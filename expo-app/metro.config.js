const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for Zustand persist middleware - forces Metro to use CJS instead of ESM
// This avoids the "import.meta is currently unsupported" error with Hermes
config.resolver.unstable_conditionNames = [
  "require",
  "react-native",
  "default",
];

module.exports = withNativeWind(config, { input: "./global.css" });
