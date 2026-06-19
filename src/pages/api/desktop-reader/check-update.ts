import type { NextApiRequest, NextApiResponse } from "next";

import {
  DESKTOP_READER_VERSION_CONFIG,
  type DesktopReaderVersionResponse,
} from "@/constants/desktop-version";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DesktopReaderVersionResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      downloadUrl: "",
      version: "",
    });
  }

  // Simple response - just version and download URL
  const response: DesktopReaderVersionResponse = {
    downloadUrl: DESKTOP_READER_VERSION_CONFIG.DOWNLOAD_URL,
    version: DESKTOP_READER_VERSION_CONFIG.VERSION,
  };

  // Set cache for 5 minutes
  res.setHeader("Cache-Control", "public, max-age=300");

  return res.status(200).json(response);
}