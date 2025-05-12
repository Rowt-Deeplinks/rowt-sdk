import { NativeModules, NativeEventEmitter, Platform, EmitterSubscription } from 'react-native';

interface DeepLinkEvent {
  url: string;
}

interface DeepLinkModuleInterface {
  getInitialDeepLink(): Promise<string | null>;
}

const { RowtDeepLink } = NativeModules;

// Check if native module is available
if (!RowtDeepLink) {
  console.warn('RowtDeepLink native module is not available. Deep link handling will not work.');
}

class DeepLinkManager extends NativeEventEmitter {
  private module: DeepLinkModuleInterface;

  constructor() {
    super(RowtDeepLink);
    this.module = RowtDeepLink;
  }

  async getInitialURL(): Promise<string | null> {
    if (!this.module) {
      return null;
    }
    
    try {
      return await this.module.getInitialDeepLink();
    } catch (error) {
      console.error('Error getting initial deep link:', error);
      return null;
    }
  }

  addDeepLinkListener(callback: (url: string) => void): EmitterSubscription {
    return this.addListener('onRowtDeepLinkReceived', (event: DeepLinkEvent) => {
      callback(event.url);
    });
  }
}

export const DeepLinkNativeModule = RowtDeepLink ? new DeepLinkManager() : null;