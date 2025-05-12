import { Platform } from 'react-native';
import { ParsedDeepLink } from './types';

// Platform detection - this checks if we're in Expo or React Native CLI
const isExpo = (() => {
  try {
    const ExpoConstants = require('expo-constants').default;
    return !!ExpoConstants.manifest || !!ExpoConstants.expoConfig;
  } catch {
    return false;
  }
})();

// Import the correct implementation based on platform
// This is the key - we're importing different implementations based on the environment
const DeepLinkImplementation = isExpo 
  ? require('./expo').ExpoRowtConsole 
  : require('./native').NativeRowtConsole;

export interface RowtConfig {
  apiKey?: string;
  baseURL?: string;
  debug?: boolean;
}

export class RowtConsole {
  private static config: RowtConfig = {
    debug: false,
  };

  // The initialize method that was missing
  static initialize(config: RowtConfig) {
    this.config = { ...this.config, ...config };
    if (this.config.debug) {
      console.log('[Rowt SDK] Initialized with config:', config);
    }
  }

  // All these methods delegate to the platform-specific implementation
  static async getInitialDeepLink(): Promise<string | null> {
    try {
      const url = await DeepLinkImplementation.getInitialDeepLink();
      if (this.config.debug && url) {
        console.log('[Rowt SDK] Initial deep link:', url);
      }
      return url;
    } catch (error) {
      console.error('[Rowt SDK] Error getting initial deep link:', error);
      return null;
    }
  }

  static addDeepLinkListener(handler: (url: string) => void) {
    if (this.config.debug) {
      console.log('[Rowt SDK] Adding deep link listener');
    }
    
    const wrappedHandler = (url: string) => {
      if (this.config.debug) {
        console.log('[Rowt SDK] Received deep link:', url);
      }
      handler(url);
    };
    
    return DeepLinkImplementation.addDeepLinkListener(wrappedHandler);
  }

  static parseDeepLink(url: string): ParsedDeepLink {
    // This is platform-agnostic, so we implement it here
    const pattern = /^(\w+):\/\/([^\/\?]*)([^?]*)(?:\?(.*))?$/;
    const match = url.match(pattern);
    
    if (!match) {
      throw new Error('Invalid deep link format');
    }
    
    const [, scheme, host, path, queryString] = match;
    const segments = path.split('/').filter(Boolean);
    
    const params: Record<string, string> = {};
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value || '');
      });
    }
    
    return {
      scheme,
      host: host || '',
      path: path || '/',
      segments,
      params,
      originalUrl: url,
    };
  }

  // This method is only available in Expo
  static createDeepLink(path: string, params?: Record<string, string>): string {
    if (isExpo) {
      return DeepLinkImplementation.createDeepLink(path, params);
    }
    throw new Error('createDeepLink is only available in Expo');
  }

  // Additional methods that might be useful
  static isExpo(): boolean {
    return isExpo;
  }
}