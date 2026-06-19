/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";

interface QZSigningState {
  isSigningInitialized: boolean;
  signingError: string | null;
  certificateLoaded: boolean;
}

export const useQZSigning = () => {
  const [state, setState] = useState<QZSigningState>({
    certificateLoaded: false,
    isSigningInitialized: false,
    signingError: null,
  });

  const initializeSigning = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).qz) {
      setState((prev) => ({ ...prev, signingError: "QZ Tray not available" }));
      return false;
    }

    try {
      const qz = (window as any).qz;

      // Set certificate promise - loads the digital certificate
      qz.security.setCertificatePromise(
        (resolve: (cert: string) => void, reject: (error: any) => void) => {
          fetch("/digital-certificate.txt", {
            cache: "no-store",
            headers: { "Content-Type": "text/plain" },
          })
            .then((response) => {
              if (response.ok) {
                response.text().then((cert: string) => {
                  setState((prev) => ({ ...prev, certificateLoaded: true }));
                  resolve(cert);
                });
              } else {
                const error = `Failed to load certificate: ${response.statusText}`;
                setState((prev) => ({ ...prev, signingError: error }));
                reject(error);
              }
            })
            .catch((error: any) => {
              setState((prev) => ({ ...prev, signingError: error.message }));
              reject(error);
            });
        }
      );

      // Set signature algorithm (SHA512 for QZ Tray 2.1+)
      qz.security.setSignatureAlgorithm("SHA512");

      // Set signature promise - signs each message to enable silent printing
      qz.security.setSignaturePromise((toSign: string) => {
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
                const error = `Failed to sign message: ${response.statusText}`;
                reject(error);
              }
            })
            .catch(reject);
        };
      });

      setState((prev) => ({
        ...prev,
        isSigningInitialized: true,
        signingError: null,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown signing error";
      setState((prev) => ({ ...prev, signingError: errorMessage }));
      return false;
    }
  }, []);

  const resetSigning = useCallback(() => {
    setState({
      certificateLoaded: false,
      isSigningInitialized: false,
      signingError: null,
    });
  }, []);

  const testConnection = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).qz) {
      return { message: "QZ Tray not available", success: false };
    }

    try {
      const qz = (window as any).qz;
      await qz.websocket.connect();

      if (qz.websocket.isActive()) {
        const version = await qz.version();
        return {
          message: `QZ Tray connected successfully with signing. Version: ${version}`,
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
  }, []);

  return useMemo(
    () => ({
      ...state,
      initializeSigning,
      resetSigning,
      testConnection,
    }),
    [state, initializeSigning, resetSigning, testConnection]
  );
};
