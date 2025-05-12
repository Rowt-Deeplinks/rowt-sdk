// Detect if we're in Expo or React Native CLI
const isExpo = (() => {
  try {
    // Check if Expo constants are available
    const ExpoConstants = require('expo-constants').default;
    return !!ExpoConstants.manifest || !!ExpoConstants.expoConfig;
  } catch {
    return false;
  }
})();

// Export the appropriate implementation
if (isExpo) {
  module.exports = require('./expo');
} else {
  module.exports = require('./native');
}