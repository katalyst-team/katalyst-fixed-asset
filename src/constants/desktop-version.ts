// Desktop Reader Version Configuration
export const DESKTOP_READER_VERSION_CONFIG = {
  // Download URL
  DOWNLOAD_URL:
    process.env.NEXT_PUBLIC_ENV === "development"
      ? "https://nos.jkt-1.neo.id/desktop-version/desktop-reader-v1.0.0-staging.zip"
      : "https://nos.jkt-1.neo.id/desktop-version/desktop-reader-v1.0.0-staging.zip",

  // Current version
  VERSION: "1.0.0",

  VERSION_CODE: 100, // Format: Major * 100 + Minor * 10 + Patch
} as const;

// Simple response interface for desktop reader version check
export interface DesktopReaderVersionResponse {
  version: string;
  downloadUrl: string;
}
