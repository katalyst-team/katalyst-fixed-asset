import type { NextApiRequest, NextApiResponse } from "next";

import {
  getCurrentScannerVersion,
  type ScannerAppVersion,
} from "@/constants/app-version";

interface ApiError {
  error: string;
  message: string;
  code?: string;
}

interface VersionUpdateRequest {
  version: string;
  versionCode: number;
  releaseDate: string;
  downloadUrl: string;
  minRequiredVersion: string;
  minRequiredVersionCode: number;
  releaseNotes: {
    en: string[];
    id: string[];
  };
  checksumMD5?: string;
  fileSizeBytes?: number;
}

interface VersionResponse {
  success: boolean;
  data?: ScannerAppVersion;
  message: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScannerAppVersion | VersionResponse | ApiError>
) {
  try {
    switch (req.method) {
      case "GET":
        return handleGetVersion(req, res);
      case "POST":
        return handleUpdateVersion(req, res);
      default:
        return res.status(405).json({
          code: "METHOD_NOT_ALLOWED",
          error: "Method Not Allowed",
          message: `Method ${req.method} is not allowed`,
        });
    }
  } catch (error) {
    console.error("[Version Management Error]", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Internal Server Error",
      message: "An error occurred while managing version",
    });
  }
}

function handleGetVersion(
  req: NextApiRequest,
  res: NextApiResponse<ScannerAppVersion | ApiError>
) {
  try {
    const currentVersion = getCurrentScannerVersion();

    // Set cache headers for reasonable caching (5 minutes)
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600"
    );

    return res.status(200).json(currentVersion);
  } catch (error) {
    console.error("[Get Version Error]", error);
    return res.status(500).json({
      code: "GET_VERSION_ERROR",
      error: "Internal Server Error",
      message: "Failed to retrieve version information",
    });
  }
}

function handleUpdateVersion(
  req: NextApiRequest,
  res: NextApiResponse<VersionResponse | ApiError>
) {
  try {
    // This would typically require authentication/authorization
    // For demo purposes, we'll just validate the request body

    const updateData: VersionUpdateRequest = req.body;

    // Validate required fields
    const requiredFields = [
      "version",
      "versionCode",
      "releaseDate",
      "downloadUrl",
      "minRequiredVersion",
      "minRequiredVersionCode",
      "releaseNotes",
    ];

    for (const field of requiredFields) {
      if (!updateData[field as keyof VersionUpdateRequest]) {
        return res.status(400).json({
          code: "MISSING_FIELD",
          error: "Validation Error",
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(updateData.version)) {
      return res.status(400).json({
        code: "INVALID_VERSION_FORMAT",
        error: "Validation Error",
        message: "Version must follow semantic versioning (e.g., 1.2.3)",
      });
    }

    // Validate version code is positive integer
    if (
      !Number.isInteger(updateData.versionCode) ||
      updateData.versionCode <= 0
    ) {
      return res.status(400).json({
        code: "INVALID_VERSION_CODE",
        error: "Validation Error",
        message: "Version code must be a positive integer",
      });
    }

    // Validate release notes structure
    if (
      !updateData.releaseNotes.en ||
      !updateData.releaseNotes.id ||
      !Array.isArray(updateData.releaseNotes.en) ||
      !Array.isArray(updateData.releaseNotes.id)
    ) {
      return res.status(400).json({
        code: "INVALID_RELEASE_NOTES",
        error: "Validation Error",
        message: "Release notes must contain 'en' and 'id' arrays",
      });
    }

    // In a real application, you would:
    // 1. Update the version in your database
    // 2. Trigger CI/CD pipeline to build new version
    // 3. Update configuration files
    // 4. Send notifications to relevant teams

    // For demo purposes, we'll return a success response
    const updatedVersion: ScannerAppVersion = {
      checksumMD5: updateData.checksumMD5,
      downloadUrl: updateData.downloadUrl,
      fileSizeBytes: updateData.fileSizeBytes,
      isForceUpdate: false,
      // This would be determined by your business logic
      minRequiredVersion: updateData.minRequiredVersion,

      minRequiredVersionCode: updateData.minRequiredVersionCode,

      releaseDate: updateData.releaseDate,

      releaseNotes: updateData.releaseNotes,
      version: updateData.version,
      versionCode: updateData.versionCode,
    };

    return res.status(200).json({
      data: updatedVersion,
      message: `Version ${updateData.version} has been prepared for update`,
      success: true,
    });
  } catch (error) {
    console.error("[Update Version Error]", error);
    return res.status(500).json({
      code: "UPDATE_VERSION_ERROR",
      error: "Internal Server Error",
      message: "Failed to update version information",
    });
  }
}
