// Add these types to your existing types.ts file

export interface DeepLinkEvent {
  url: string;
}

export interface ParsedDeepLink {
  scheme: string;
  path: string;
  segments: string[];
  params: Record<string, string>;
  originalUrl: string;
}

export interface DeepLinkSubscription {
  remove(): void;
}