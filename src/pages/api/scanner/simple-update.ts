import type { NextApiRequest, NextApiResponse } from "next";

import {
  checkUpdateNeeded,
  SIMPLE_VERSION_CONFIG,
  type SimpleUpdateResponse,
} from "@/constants/simple-version";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleUpdateResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      downloadUrl: "",
      hasUpdate: false,
      isForceUpdate: false,
      latestVersion: "",
    });
  }

  // Get user version from query
  const { versionCode } = req.query;

  // Parse user version code, default to 0 if not provided
  let userVersionCode = 0;
  if (versionCode && typeof versionCode === "string") {
    userVersionCode = parseInt(versionCode, 10);
    if (isNaN(userVersionCode)) userVersionCode = 0;
  }

  // Check if update needed
  const { hasUpdate, isForceUpdate } = checkUpdateNeeded(userVersionCode);

  // Simple response
  const response: SimpleUpdateResponse = {
    downloadUrl: SIMPLE_VERSION_CONFIG.DOWNLOAD_URL,
    hasUpdate,
    isForceUpdate,
    latestVersion: SIMPLE_VERSION_CONFIG.VERSION,
  };

  // Set cache for 5 minutes
  res.setHeader("Cache-Control", "public, max-age=300");

  return res.status(200).json(response);
}
