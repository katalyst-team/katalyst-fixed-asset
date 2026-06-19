// Simple Version Configuration for Scanner App
export const SIMPLE_VERSION_CONFIG = {
  // Download URL
  DOWNLOAD_URL:
    process.env.NEXT_PUBLIC_ENV === "development"
      ? "https://nos.jkt-1.neo.id/app-apk-version/scanner-v1.6.0-staging.apk"
      : "https://nos.jkt-1.neo.id/app-apk-version/scanner-v1.4.5-release.apk",

  // Minimum version for force update
  MIN_VERSION_CODE: 90,

  // Current version
  VERSION: process.env.NEXT_PUBLIC_ENV === "development" ? "1.6.0" : "1.4.5",

  VERSION_CODE: process.env.NEXT_PUBLIC_ENV === "development" ? 160 : 145, // Versions below this need force update
} as const;

// Simple response interface
export interface SimpleVersionResponse {
  version: string;
  versionCode: number;
  downloadUrl: string;
}

// Simple update check response
export interface SimpleUpdateResponse {
  hasUpdate: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
}

// Helper to check if update needed
export function checkUpdateNeeded(userVersionCode: number) {
  const hasUpdate = userVersionCode < SIMPLE_VERSION_CONFIG.VERSION_CODE;
  const isForceUpdate =
    userVersionCode < SIMPLE_VERSION_CONFIG.MIN_VERSION_CODE;

  return { hasUpdate, isForceUpdate };
}
