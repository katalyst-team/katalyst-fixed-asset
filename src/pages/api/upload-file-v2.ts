// pages/api/upload-file-v2.ts
import formidable from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  fileUrl: string;
  success: boolean;
  error?: string;
};

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser to use formidable
  },
  // Maximum allowed duration for this function to execute (in seconds)
  maxDuration: 120,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Set CORS headers to allow all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, sec-ch-ua-platform, Referer, User-Agent, Accept, sec-ch-ua, sec-ch-ua-mobile"
  );

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
    const form = formidable({
      keepExtensions: true,
      // 100MB - maximum file size
maxFieldsSize: 1000 * 1024 * 1024,
      maxFileSize: 1000 * 1024 * 1024, // 100MB - maximum total size of all fields (THIS WAS THE ISSUE!)
      maxTotalFileSize: 1000 * 1024 * 1024, // 100MB - maximum total size of all files
    });

    const [fields, files] = await form.parse(req);

    const uploadUrl = Array.isArray(fields.uploadUrl)
      ? fields.uploadUrl[0]
      : fields.uploadUrl;
    const bucket = Array.isArray(fields.bucket)
      ? fields.bucket[0]
      : fields.bucket;
    const filename = Array.isArray(fields.filename)
      ? fields.filename[0]
      : fields.filename;
    const contentType = Array.isArray(fields.contentType)
      ? fields.contentType[0]
      : fields.contentType;

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadUrl || !bucket || !filename || !file) {
      console.error("Missing fields:", {
        bucket: !!bucket,
        file: !!file,
        filename: !!filename,
        uploadUrl: !!uploadUrl,
      });
      return res.status(400).json({
        error: "Missing required fields",
        fileUrl: "",
        success: false,
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload to S3 via presigned URL
    const response = await fetch(uploadUrl, {
      body: fileBuffer,
      headers: {
        "Content-Type":
          contentType || file.mimetype || "application/octet-stream",
      },
      method: "PUT",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("S3 upload failed:", {
        error: errorText,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(
        `Upload failed: ${response.statusText} - ${errorText}`
      );
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
