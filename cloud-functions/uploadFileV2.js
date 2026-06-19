const functions = require("@google-cloud/functions-framework");

functions.http("uploadFileV2", async (req, res) => {
  const MAX_TOTAL_SIZE = 1000 * 1024 * 1024;
  const HEADER_SEPARATOR = Buffer.from("\r\n\r\n");
  const LINE_BREAK = Buffer.from("\r\n");

  const sendJson = (status, payload) => {
    res.status(status);
    res.set("Content-Type", "application/json");
    res.send(JSON.stringify(payload));
  };

  const raise = (status, message) => {
    const error = new Error(message);
    error.statusCode = status;
    return error;
  };

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, sec-ch-ua-platform, Referer, User-Agent, Accept, sec-ch-ua, sec-ch-ua-mobile"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).send("");
  }

  if (req.method !== "POST") {
    return sendJson(405, {
      error: "Method not allowed",
      fileUrl: "",
      success: false,
    });
  }

  try {
    const contentTypeHeader = req.headers["content-type"] || "";
    const boundaryMatch = contentTypeHeader.match(/boundary=([^;]+)/i);
    if (!boundaryMatch) {
      throw raise(400, "Invalid multipart/form-data payload");
    }

    const boundary = boundaryMatch[1];
    const delimiter = Buffer.from(`--${boundary}`);

    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      let totalSize = 0;

      req.on("data", (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_TOTAL_SIZE) {
          reject(raise(413, "Uploaded file exceeds size limit"));
          return;
        }
        chunks.push(chunk);
      });

      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", (error) => reject(raise(500, error.message)));
    });

    const segments = [];
    let startIndex = buffer.indexOf(delimiter);
    while (startIndex !== -1) {
      const nextIndex = buffer.indexOf(delimiter, startIndex + delimiter.length);
      if (nextIndex === -1) {
        const finalPart = buffer.slice(startIndex + delimiter.length);
        segments.push(finalPart);
        break;
      }
      const part = buffer.slice(
        startIndex + delimiter.length,
        nextIndex - LINE_BREAK.length
      );
      segments.push(part);
      startIndex = nextIndex;
    }

    const fields = {};
    const files = {};

    for (const segment of segments) {
      if (!segment.length) {
        continue;
      }

      let part = segment;

      if (
        part.length >= 2 &&
        part[0] === LINE_BREAK[0] &&
        part[1] === LINE_BREAK[1]
      ) {
        part = part.slice(2);
      }

      if (
        part.length >= 2 &&
        part[part.length - 2] === 45 &&
        part[part.length - 1] === 45
      ) {
        part = part.slice(0, part.length - 2);
      }

      if (!part.length) {
        continue;
      }

      const headerEndIndex = part.indexOf(HEADER_SEPARATOR);
      if (headerEndIndex === -1) {
        continue;
      }

      const headerBlock = part.slice(0, headerEndIndex).toString("utf8");
      let body = part.slice(headerEndIndex + HEADER_SEPARATOR.length);

      let end = body.length;
      while (end >= 2) {
        const lastTwo = body.slice(end - 2, end);
        if (lastTwo[0] === LINE_BREAK[0] && lastTwo[1] === LINE_BREAK[1]) {
          end -= 2;
          continue;
        }
        break;
      }
      body = body.slice(0, end);

      if (!body.length) {
        continue;
      }

      const headers = {};
      headerBlock.split("\r\n").forEach((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) {
          return;
        }
        const key = line.slice(0, separatorIndex).trim().toLowerCase();
        const value = line.slice(separatorIndex + 1).trim();
        if (key) {
          headers[key] = value;
        }
      });

      const disposition = headers["content-disposition"] || "";
      const nameMatch = disposition.match(/name="([^"]+)"/i);
      if (!nameMatch) {
        continue;
      }
      const fieldName = nameMatch[1];
      const filenameMatch = disposition.match(/filename="([^"]*)"/i);

      if (filenameMatch && filenameMatch[1]) {
        files[fieldName] = {
          buffer: body,
          contentType: headers["content-type"],
          filename: filenameMatch[1],
        };
      } else {
        fields[fieldName] = body.toString("utf8");
      }
    }

    const uploadUrl = fields.uploadUrl;
    const bucket = fields.bucket;
    const filename = fields.filename;
    const contentType = fields.contentType;
    const file = files.file;

    if (!uploadUrl || !bucket || !filename || !file) {
      throw raise(400, "Missing required fields");
    }

    const body = file.buffer;
    const inferredType =
      contentType || file.contentType || "application/octet-stream";

    const uploadResponse = await fetch(uploadUrl, {
      body,
      headers: {
        "Content-Type": inferredType,
      },
      method: "PUT",
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw raise(
        502,
        `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`
      );
    }

    const fileUrl = `https://nos.jkt-1.neo.id/${bucket}/${filename}`;

    return sendJson(200, {
      fileUrl,
      success: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const status = typeof error.statusCode === "number" ? error.statusCode : 500;
    return sendJson(status, {
      error: error.message || "Unknown error",
      fileUrl: "",
      success: false,
    });
  }
});
