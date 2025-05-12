import { Platform } from 'react-native';

// Platform detection utilities
const isExpo = (() => {
  try {
    const ExpoConstants = require('expo-constants').default;
    return !!ExpoConstants.manifest || !!ExpoConstants.expoConfig;
  } catch {
    return false;
  }
})();

// Import the appropriate implementation
const DeepLinkImplementation = isExpo 
  ? require('./expo').ExpoRowtConsole 
  : require('./native').NativeRowtConsole;

export class RowtConsole {
  // Your existing methods...

  // Platform-agnostic deep link methods
  static async getInitialDeepLink(): Promise<string | null> {
    return DeepLinkImplementation.getInitialDeepLink();
  }

  static addDeepLinkListener(handler: (url: string) => void) {
    return DeepLinkImplementation.addDeepLinkListener(handler);
  }

  static parseDeepLink(url: string) {
    return DeepLinkImplementation.parseDeepLink(url);
  }

  // Expo-specific method (only available in Expo)
  static createDeepLink(path: string, params?: Record<string, string>): string {
    if (isExpo) {
      return DeepLinkImplementation.createDeepLink(path, params);
    }
    throw new Error('createDeepLink is only available in Expo');
  }
}

// Export the appropriate hook based on platform
export const useDeepLink = isExpo 
  ? require('./expo/hooks').useDeepLink 
  : require('./native/hooks').useDeepLink;