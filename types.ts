export interface DeepLinkEvent {
  url: string;
}

export interface ParsedDeepLink {
  scheme: string;
  host: string;
  path: string;
  segments: string[];
  params: Record<string, string>;
  originalUrl: string;
}

export interface DeepLinkSubscription {
  remove(): void;
}

export interface RowtConfig {
  apiKey?: string;
  baseURL?: string;
  debug?: boolean;
}