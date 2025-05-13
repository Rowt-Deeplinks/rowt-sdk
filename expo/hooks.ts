import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";

export function useDeepLink(handler: (url: string) => void) {
  const handlerRef = useRef(handler);

  // Update ref to latest handler
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handlerRef.current(url);
      }
    });

    // Listen for new URLs
    const subscription = Linking.addEventListener("url", (event) => {
      handlerRef.current(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

// Alternative hook using Expo's useURL hook
export function useExpoDeepLink(handler: (url: string) => void) {
  const url = Linking.useURL();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (url) {
      handlerRef.current(url);
    }
  }, [url]);
}
