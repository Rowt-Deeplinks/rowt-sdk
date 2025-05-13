import * as Linking from "expo-linking";
import { EventEmitter } from "events";

class ExpoDeepLinkManager extends EventEmitter {
  private initialURL: string | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    // Get initial URL
    this.initialURL = await Linking.getInitialURL();

    // Listen for URL changes
    Linking.addEventListener("url", this.handleDeepLink);
  }

  private handleDeepLink = (event: { url: string }) => {
    this.emit("deepLink", event.url);
  };

  async getInitialURL(): Promise<string | null> {
    if (this.initialURL === undefined) {
      // Wait a bit for initialization if needed
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.initialURL;
  }

  addDeepLinkListener(callback: (url: string) => void) {
    this.on("deepLink", callback);
    return {
      remove: () => {
        this.off("deepLink", callback);
      },
    };
  }

  cleanup() {
    Linking.removeEventListener("url", this.handleDeepLink);
  }
}

export const DeepLinkModule = new ExpoDeepLinkManager();
