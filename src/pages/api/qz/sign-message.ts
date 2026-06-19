import crypto from "crypto";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { request } = req.body;

    if (!request) {
      return res.status(400).json({ error: "Missing request parameter" });
    }

    // Path to private key - check multiple locations
    const possiblePaths = [
      path.join(process.cwd(), "private-key.pem"), // Project root
      path.join(process.cwd(), "public", "private-key.pem"), // Public folder
      path.join(__dirname, "private-key.pem"), // Same directory as API
      path.join(process.cwd(), "src", "pages", "api", "qz", "private-key.pem"), // API folder
    ];

    let privateKeyPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        privateKeyPath = possiblePath;
        break;
      }
    }

    // Check if private key exists
    if (!privateKeyPath) {
      console.error(
        "Private key not found in any of the following locations:",
        possiblePaths
      );
      return res.status(500).json({ error: "Private key not found" });
    }

    // Read private key
    const privateKeyContent = fs.readFileSync(privateKeyPath, "utf8");

    // Create signature using SHA512 (for QZ Tray 2.1+)
    const sign = crypto.createSign("SHA512");
    sign.update(request);
    sign.end();

    // Generate signature
    const signature = sign.sign(privateKeyContent);

    // Return base64 encoded signature
    const base64Signature = signature.toString("base64");

    // Set headers for plain text response
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(base64Signature);
  } catch (error) {
    console.error("Error signing message:", error);
    return res.status(500).json({ error: "Error signing message" });
  }
}
