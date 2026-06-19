import type { NextApiRequest, NextApiResponse } from "next";

import {
  SIMPLE_VERSION_CONFIG,
  type SimpleVersionResponse,
} from "@/constants/simple-version";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleVersionResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      downloadUrl: "",
      version: "",
      versionCode: 0,
    });
  }

  // Simple response - just version and download URL
  const response: SimpleVersionResponse = {
    downloadUrl: SIMPLE_VERSION_CONFIG.DOWNLOAD_URL,
    version: SIMPLE_VERSION_CONFIG.VERSION,
    versionCode: SIMPLE_VERSION_CONFIG.VERSION_CODE,
  };

  // Set cache for 5 minutes
  res.setHeader("Cache-Control", "public, max-age=300");

  return res.status(200).json(response);
}
