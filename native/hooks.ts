import { useEffect, useRef } from 'react';
import { DeepLinkNativeModule } from './DeepLinkManager';

export function useDeepLink(handler: (url: string) => void) {
  const handlerRef = useRef(handler);
  
  // Update ref to latest handler to avoid stale closures
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!DeepLinkNativeModule) {
      console.warn('Deep link native module not available');
      return;
    }

    // Handle initial deep link
    DeepLinkNativeModule.getInitialURL().then((url) => {
      if (url) {
        handlerRef.current(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = DeepLinkNativeModule.addDeepLinkListener((url) => {
      handlerRef.current(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}