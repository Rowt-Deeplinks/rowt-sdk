// Platform detection
const isExpo = (() => {
  try {
    const ExpoConstants = require('expo-constants').default;
    return !!ExpoConstants.manifest || !!ExpoConstants.expoConfig;
  } catch {
    return false;
  }
})();

// Export main SDK class
export { RowtConsole } from './Rowt';

// Export types
export * from './types';

// Export the appropriate hook based on platform
export const useDeepLink = isExpo 
  ? require('./expo/hooks').useDeepLink 
  : require('./native/hooks').useDeepLink;

// Optional: Export platform-specific implementations for advanced users
export const PlatformImplementation = isExpo 
  ? require('./expo').ExpoRowtConsole 
  : require('./native').NativeRowtConsole;

// Export platform detection utility
export const isExpoEnvironment = () => isExpo;