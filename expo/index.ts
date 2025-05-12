import * as Linking from 'expo-linking';
import { DeepLinkModule } from './linking';
import { useDeepLink, useExpoDeepLink } from './hooks';

export { useDeepLink, useExpoDeepLink };

export class ExpoRowtConsole {
  // Your existing RowtConsole methods plus:

  static async getInitialDeepLink(): Promise<string | null> {
    return await Linking.getInitialURL();
  }

  static addDeepLinkListener(handler: (url: string) => void) {
    return Linking.addEventListener('url', (event) => {
      handler(event.url);
    });
  }

  static parseDeepLink(url: string) {
    // Same implementation as before
    const parsed = Linking.parse(url);
    return {
      scheme: parsed.scheme || '',
      hostname: parsed.hostname || '',
      path: parsed.path || '',
      queryParams: parsed.queryParams || {},
      segments: (parsed.path || '').split('/').filter(Boolean),
    };
  }

  // Create deep links for Expo
  static createDeepLink(path: string, params?: Record<string, string>) {
    return Linking.createURL(path, {
      queryParams: params,
    });
  }

  // Check if app can open URL
  static async canOpenURL(url: string): Promise<boolean> {
    return await Linking.canOpenURL(url);
  }

  // Open URL in browser or other app
  static async openURL(url: string): Promise<void> {
    await Linking.openURL(url);
  }
}