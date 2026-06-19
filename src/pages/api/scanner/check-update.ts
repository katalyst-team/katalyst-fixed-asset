import type { NextApiRequest, NextApiResponse } from "next";

import {
  getCurrentScannerVersion,
  isVersionUpdateRequired,
  parseVersionCode,
  type UpdateCheckResponse,
} from "@/constants/app-version";

interface ApiError {
  error: string;
  message: string;
  code?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateCheckResponse | ApiError>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      error: "Method Not Allowed",
      message: "Only GET requests are allowed",
    });
  }

  try {
    // Get user's current version from query parameters
    const { version: userVersion, versionCode: userVersionCodeParam } =
      req.query;

    let userVersionCode: number;
    let userVersionString: string;

    // Parse user version
    if (userVersionCodeParam && typeof userVersionCodeParam === "string") {
      // If version code is provided directly
      userVersionCode = parseInt(userVersionCodeParam, 10);
      userVersionString = (userVersion as string) || "unknown";
    } else if (userVersion && typeof userVersion === "string") {
      // If version string is provided, parse it to version code
      userVersionCode = parseVersionCode(userVersion);
      userVersionString = userVersion;
    } else {
      // No version provided - assume very old version to force update
      userVersionCode = 0;
      userVersionString = "unknown";
    }

    // Check if version is valid
    if (isNaN(userVersionCode) || userVersionCode < 0) {
      return res.status(400).json({
        code: "INVALID_VERSION",
        error: "Invalid Version",
        message: "Version code must be a valid positive number",
      });
    }

    // Get current latest version info
    const currentVersion = getCurrentScannerVersion();

    // Check if update is required
    const { hasUpdate, isForceUpdate } =
      isVersionUpdateRequired(userVersionCode);

    // Prepare response messages
    const messages = {
      en: {
        hasUpdate: isForceUpdate
          ? "A critical update is required. Please update your app to continue."
          : hasUpdate
            ? "A new version is available. Please update for the latest features."
            : "Your app is up to date.",
        noUpdate: "Your app is up to date.",
      },
      id: {
        hasUpdate: isForceUpdate
          ? "Update penting diperlukan. Silakan update aplikasi untuk melanjutkan."
          : hasUpdate
            ? "Versi baru tersedia. Silakan update untuk fitur terbaru."
            : "Aplikasi Anda sudah yang terbaru.",
        noUpdate: "Aplikasi Anda sudah yang terbaru.",
      },
    };

    // Build response
    const response: UpdateCheckResponse = {
      currentVersion: {
        ...currentVersion,
        isForceUpdate, // Set force update flag based on user's version
      },
      hasUpdate,
      isForceUpdate,
      message: {
        en: hasUpdate ? messages.en.hasUpdate : messages.en.noUpdate,
        id: hasUpdate ? messages.id.hasUpdate : messages.id.noUpdate,
      },
      userVersion: {
        version: userVersionString,
        versionCode: userVersionCode,
      },
    };

    // Set cache headers for reasonable caching (5 minutes)
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600"
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("[Update Check Error]", error);

    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Internal Server Error",
      message: "An error occurred while checking for updates",
    });
  }
}
