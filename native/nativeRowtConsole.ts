import { NativeModules, NativeEventEmitter } from "react-native";
import { ParsedDeepLink, DeepLinkSubscription } from "../types";

// Get the native module
const { RowtDeepLink } = NativeModules;

// Check if the native module is available
if (!RowtDeepLink) {
  console.warn(
    "[Rowt SDK] Native module not available. Deep link handling will not work.",
  );
}

// Create event emitter if native module exists
const eventEmitter = RowtDeepLink ? new NativeEventEmitter(RowtDeepLink) : null;

export class NativeRowtConsole {
  // Implementation for React Native CLI apps
  static async getInitialDeepLink(): Promise<string | null> {
    if (!RowtDeepLink) {
      console.warn(
        "[Rowt SDK] Cannot get initial deep link - native module not available",
      );
      return null;
    }

    try {
      return await RowtDeepLink.getInitialDeepLink();
    } catch (error) {
      console.error("[Rowt SDK] Error getting initial deep link:", error);
      return null;
    }
  }

  static addDeepLinkListener(
    handler: (url: string) => void,
  ): DeepLinkSubscription {
    if (!eventEmitter) {
      console.warn(
        "[Rowt SDK] Cannot add listener - native module not available",
      );
      return { remove: () => {} };
    }

    const subscription = eventEmitter.addListener(
      "onRowtDeepLinkReceived",
      (event) => {
        handler(event.url);
      },
    );

    return {
      remove: () => subscription.remove(),
    };
  }

  // Note: createDeepLink is not implemented for native
  // The main RowtConsole handles this appropriately
}
