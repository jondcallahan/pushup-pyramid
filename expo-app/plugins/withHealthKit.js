const { withEntitlementsPlist, withInfoPlist } = require("@expo/config-plugins");

/**
 * Expo config plugin to properly configure react-native-health
 * Adds HealthKit entitlements and Info.plist entries.
 * Note: react-native-health supports autolinking, so no Podfile modification is needed.
 */

// Add HealthKit entitlements
const withHealthKitEntitlements = (config) => {
  return withEntitlementsPlist(config, (config) => {
    // Standard HealthKit entitlement for Fitness
    config.modResults["com.apple.developer.healthkit"] = true;

    // NOTE: "com.apple.developer.healthkit.access" is for Clinical Health Records.
    // We do NOT include it as it requires special provisioning and is not needed for workouts.
    // If included without provisioning, the app will fail to install/launch.

    return config;
  });
};

// Add HealthKit usage descriptions to Info.plist
const withHealthKitInfoPlist = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSHealthShareUsageDescription =
      config.modResults.NSHealthShareUsageDescription ||
      "This app syncs your workouts to Apple Health.";
    config.modResults.NSHealthUpdateUsageDescription =
      config.modResults.NSHealthUpdateUsageDescription ||
      "This app saves your completed workouts to Apple Health.";
    return config;
  });
};

// Main plugin - combines all modifications
const withHealthKit = (config) => {
  config = withHealthKitEntitlements(config);
  config = withHealthKitInfoPlist(config);
  return config;
};

module.exports = withHealthKit;
