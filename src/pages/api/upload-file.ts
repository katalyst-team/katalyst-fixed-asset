// pages/api/upload-file.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  fileUrl: string;
  success: boolean;
  error?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "30mb", // Adjust based on your needs
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Set CORS headers to allow all origins
  res.setHeader("Access-Control-Allow-Origin", "mit -m ");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed", fileUrl: "", success: false });
  }

  try {
    const { uploadUrl, bucket, filename, fileBuffer, contentType } = req.body;

    if (!uploadUrl || !bucket || !filename || !fileBuffer) {
      return res.status(400).json({
        error: "Missing required fields",
        fileUrl: "",
        success: false,
      });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileBuffer, "base64");
    // Upload to S3 via presigned URL
    const response = await fetch(uploadUrl, {
      body: buffer,
      headers: {
        "Content-Type": contentType || "image/*",
      },
      method: "PUT",
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // Construct the public URL
    const fileUrl = `https://nos.jkt-1.neo.id/${bucket}/${filename}`;
    return res.status(200).json({
      fileUrl,
      success: true,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      fileUrl: "",
      success: false,
    });
  }
}
