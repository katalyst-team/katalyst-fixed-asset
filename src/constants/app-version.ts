export interface ScannerAppVersion {
  version: string;
  versionCode: number;
  releaseDate: string;
  downloadUrl: string;
  isForceUpdate: boolean;
  minRequiredVersion: string;
  minRequiredVersionCode: number;
  releaseNotes: {
    en: readonly string[];
    id: readonly string[];
  };
  checksumMD5?: string;
  fileSizeBytes?: number;
}

export interface UpdateCheckResponse {
  hasUpdate: boolean;
  isForceUpdate: boolean;
  currentVersion: ScannerAppVersion;
  userVersion?: {
    version: string;
    versionCode: number;
  };
  message: {
    en: string;
    id: string;
  };
}

// Scanner App Version Configuration
export const SCANNER_APP_CONFIG = {
  // Download URLs (you can customize based on your distribution method)
  DOWNLOAD_URL: {
    PRODUCTION:
      "https://nos.jkt-1.neo.id/app-apk-version/scanner-v1.4.5-release.apk",
    STAGING:
      "https://nos.jkt-1.neo.id/app-apk-version/scanner-v1.6.0-staging.apk",
  },

  // File info (optional, for integrity check)
  FILE_INFO: {
    CHECKSUM_MD5: "d41d8cd98f00b204e9800998ecf8427e", // You'll need to calculate this
    FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25MB example
  },

  // Current latest version
  LATEST_VERSION:
    process.env.NEXT_PUBLIC_ENV === "development"
      ? "1.6.0"
      : ("1.4.5" as const),

  LATEST_VERSION_CODE:
    process.env.NEXT_PUBLIC_ENV === "development" ? 160 : 145,

  // Minimum supported version (versions below this will get force update)
  MIN_SUPPORTED_VERSION:
    process.env.NEXT_PUBLIC_ENV === "development"
      ? "1.6.0"
      : ("1.4.5" as const),

  MIN_SUPPORTED_VERSION_CODE:
    process.env.NEXT_PUBLIC_ENV === "development" ? 160 : 145,

  // Release info
  RELEASE_DATE: "2024-12-21",

  // Release notes
  RELEASE_NOTES: {
    en: [
      "Improved barcode scanning accuracy",
      "Added offline sync capability",
      "Enhanced user interface",
      "Bug fixes and performance improvements",
    ],
    id: [
      "Peningkatan akurasi scan barcode",
      "Tambahan fitur sinkronisasi offline",
      "Perbaikan tampilan antarmuka",
      "Perbaikan bug dan peningkatan performa",
    ],
  },
} as const;

// Helper function to compare version codes
export function isVersionUpdateRequired(userVersionCode: number): {
  hasUpdate: boolean;
  isForceUpdate: boolean;
} {
  const hasUpdate = userVersionCode < SCANNER_APP_CONFIG.LATEST_VERSION_CODE;
  const isForceUpdate =
    userVersionCode < SCANNER_APP_CONFIG.MIN_SUPPORTED_VERSION_CODE;

  return {
    hasUpdate,
    isForceUpdate,
  };
}

// Helper function to parse version string to version code
export function parseVersionCode(version: string): number {
  // Convert version like "1.2.3" to version code like 123
  const parts = version.split(".").map((part) => parseInt(part, 10));
  if (parts.length !== 3) return 0;

  return parts[0] * 100 + parts[1] * 10 + parts[2];
}

// Helper function to get current scanner app version info
export function getCurrentScannerVersion(): ScannerAppVersion {
  return {
    checksumMD5: SCANNER_APP_CONFIG.FILE_INFO.CHECKSUM_MD5,
    downloadUrl: SCANNER_APP_CONFIG.DOWNLOAD_URL.PRODUCTION,
    fileSizeBytes: SCANNER_APP_CONFIG.FILE_INFO.FILE_SIZE_BYTES,
    isForceUpdate: false,
    minRequiredVersion: SCANNER_APP_CONFIG.MIN_SUPPORTED_VERSION,
    minRequiredVersionCode: SCANNER_APP_CONFIG.MIN_SUPPORTED_VERSION_CODE,
    releaseDate: SCANNER_APP_CONFIG.RELEASE_DATE,
    releaseNotes: SCANNER_APP_CONFIG.RELEASE_NOTES,
    version: SCANNER_APP_CONFIG.LATEST_VERSION,
    versionCode: SCANNER_APP_CONFIG.LATEST_VERSION_CODE,
  };
}
