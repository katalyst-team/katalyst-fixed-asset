/* eslint-disable @typescript-eslint/no-explicit-any */

// Note: QZTrayInterface is now defined in usePrintV4.ts with security methods included

/**
 * Initialize QZ Tray with certificate and signature promises to enable silent printing
 * This removes the popup dialogs that appear on each print operation
 */
export const initializeQZSigning = async (): Promise<void> => {
  if (typeof window === "undefined" || !window.qz) {
    throw new Error("QZ Tray not available");
  }

  // Set certificate promise - loads the digital certificate
  window.qz.security.setCertificatePromise(
    (resolve: (cert: string) => void, reject: (error: any) => void) => {
      fetch("/digital-certificate.txt", {
        cache: "no-store",
        headers: { "Content-Type": "text/plain" },
      })
        .then((response) => {
          if (response.ok) {
            response.text().then(resolve);
          } else {
            reject(`Failed to load certificate: ${response.statusText}`);
          }
        })
        .catch(reject);
    }
  );

  // Set signature algorithm (SHA512 for QZ Tray 2.1+)
  window.qz.security.setSignatureAlgorithm("SHA512");

  // Set signature promise - signs each message to enable silent printing
  window.qz.security.setSignaturePromise((toSign: string) => {
    return (
      resolve: (signature: string) => void,
      reject: (error: any) => void
    ) => {
      fetch("/api/qz/sign-message", {
        body: JSON.stringify({ request: toSign }),
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            response.text().then(resolve);
          } else {
            reject(`Failed to sign message: ${response.statusText}`);
          }
        })
        .catch(reject);
    };
  });
};

/**
 * Check if QZ Tray signing is properly configured
 */
export const isQZSigningConfigured = (): boolean => {
  if (typeof window === "undefined" || !window.qz) {
    return false;
  }

  try {
    return (
      typeof window.qz.security.setCertificatePromise === "function" &&
      typeof window.qz.security.setSignaturePromise === "function"
    );
  } catch {
    return false;
  }
};

/**
 * Test if the signing setup is working by attempting to connect to QZ Tray
 */
export const testQZSigning = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (!window.qz) {
      return { message: "QZ Tray not available", success: false };
    }

    // Try to connect
    await window.qz.websocket.connect();

    if (window.qz.websocket.isActive()) {
      return {
        message: "QZ Tray connected successfully with signing",
        success: true,
      };
    } else {
      return { message: "Failed to connect to QZ Tray", success: false };
    }
  } catch (error) {
    return {
      message: `QZ Tray connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    };
  }
};

/**
 * Get QZ Tray version info
 */
export const getQZVersion = async (): Promise<string> => {
  try {
    if (!window.qz || !window.qz.websocket.isActive()) {
      throw new Error("QZ Tray not connected");
    }

    return await window.qz.version();
  } catch (error) {
    throw new Error(
      `Failed to get QZ version: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
