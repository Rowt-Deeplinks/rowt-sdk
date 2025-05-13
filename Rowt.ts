import { ParsedDeepLink } from './types';
import axios from 'axios';
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

export class Rowt {
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
      queryString.split('&').forEach((pair) => {
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

export interface RowtLinkConfig {
  serverUrl: string;
  apiKey: string;
  projectId: string;
}

export interface RowtLinkOptions {
  url: string;
  expiration?: Date;
  title?: string;
  description?: string;
  imageUrl?: string;
  fallbackUrlOverride?: string;
  additionalMetadata?: Record<string, any>;
  properties?: Record<string, any>;
}

export class RowtLink {
  private apiKey: string;
  private projectId: string;
  private serverUrl: string;
  public url: string;
  public expiration?: Date;
  public title?: string;
  public description?: string;
  public imageUrl?: string;
  public fallbackUrlOverride?: string;
  public additionalMetadata?: Record<string, any>;
  public properties?: Record<string, any>;
  public shortcode?: string;
  public shortlink?: string;

  constructor(config: RowtLinkConfig, linkDetails: RowtLinkOptions) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.serverUrl = config.serverUrl;
    this.url = linkDetails.url;
    this.expiration = linkDetails.expiration;
    this.title = linkDetails.title;
    this.description = linkDetails.description;
    this.imageUrl = linkDetails.imageUrl;
    this.fallbackUrlOverride = linkDetails.fallbackUrlOverride;
    this.additionalMetadata = linkDetails.additionalMetadata;
    this.properties = linkDetails.properties;
    this.shortcode = undefined;
    this.shortlink = undefined;
  }

  async createLink(): Promise<string> {
    try {
      const baseUrl =
        this.serverUrl.startsWith('http://') ||
        this.serverUrl.startsWith('https://')
          ? this.serverUrl
          : `http://${this.serverUrl}`;
      const response = await axios.post(
        `${baseUrl}/link`,
        {
          projectId: this.projectId,
          apiKey: this.apiKey,
          url: this.url,
          expiration: this.expiration,
          title: this.title,
          description: this.description,
          imageUrl: this.imageUrl,
          fallbackUrlOverride: this.fallbackUrlOverride,
          additionalMetadata: this.additionalMetadata,
          properties: this.properties,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const shortlinkUrl = response.data;
      this.shortlink = shortlinkUrl;

      // Extract shortcode from the shortlink URL
      const parts = shortlinkUrl.split('/');
      this.shortcode = parts[parts.length - 1];

      return shortlinkUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create link: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Failed to create link: ${error.message}`);
      } else {
        throw new Error('Failed to create link: An unknown error occurred');
      }
    }
  }

  getShortcode(): string | undefined {
    return this.shortcode;
  }

  getShortlink(): string | undefined {
    return this.shortlink;
  }
}
