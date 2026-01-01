const { withDangerousMod, withEntitlementsPlist, withInfoPlist } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to properly configure react-native-health
 * Adds HealthKit entitlements, Info.plist entries, and Podfile dependency
 */

// Add HealthKit entitlements
const withHealthKitEntitlements = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.healthkit"] = true;
    config.modResults["com.apple.developer.healthkit.access"] = [];
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

// Add react-native-health pod to Podfile
const withHealthKitPodfile = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let podfileContent = fs.readFileSync(podfilePath, "utf8");

      // Check if already added
      if (podfileContent.includes("react-native-health")) {
        return config;
      }

      // Add pod after use_expo_modules!
      const targetLine = "use_expo_modules!";
      const podLine = `\n  # HealthKit support\n  pod 'react-native-health', :path => '../node_modules/react-native-health'`;

      podfileContent = podfileContent.replace(
        targetLine,
        targetLine + podLine
      );

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
};

// Main plugin - combines all modifications
const withHealthKit = (config) => {
  config = withHealthKitEntitlements(config);
  config = withHealthKitInfoPlist(config);
  config = withHealthKitPodfile(config);
  return config;
};

module.exports = withHealthKit;
