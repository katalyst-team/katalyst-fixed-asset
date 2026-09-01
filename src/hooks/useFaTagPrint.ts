/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useQZSigning } from "@/hooks/useQZSigning";

interface QZTrayInterface {
  websocket: {
    connect: (options?: { retries?: number; delay?: number }) => Promise<void>;
    disconnect: () => Promise<void>;
    isActive: () => boolean;
  };
  printers: {
    find: (query?: string) => Promise<string[]>;
  };
  configs: {
    create: (printer: string, options?: QZConfigOptions) => QZConfig;
  };
  print: (config: QZConfig, data: string[]) => Promise<void>;
  security: {
    setCertificatePromise: (
      promise: (
        resolve: (cert: string) => void,
        reject: (error: any) => void
      ) => void
    ) => void;
    setSignatureAlgorithm: (algorithm: string) => void;
    setSignaturePromise: (
      promise: (
        toSign: string
      ) => (
        resolve: (signature: string) => void,
        reject: (error: any) => void
      ) => void
    ) => void;
  };
  version: () => Promise<string>;
}

interface QZConfig {
  printer: string;
}

interface QZConfigOptions {
  forceRawMode?: boolean;
  perSpool?: number;
}

declare global {
  interface Window {
    qz: QZTrayInterface;
  }
}

export interface FaTagPreviewSettings {
  dpmm: string;
  height: string;
  index: string;
  unit: "mm" | "inch";
  width: string;
}

export interface FaTagPrintSettings {
  availablePrinters: string[];
  isLoadingPreview: boolean;
  previewImage: string | null;
  previewSettings: FaTagPreviewSettings;
  printCount: number;
  qzStatus: "disconnected" | "connecting" | "connected" | "error";
  rawZplCode: string;
  selectedPrinter: string;
}

const mmToInches = (mm: number): number => mm / 25.4;

export const useFaTagPrint = () => {
  const { initializeSigning } = useQZSigning();
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<FaTagPrintSettings>({
    availablePrinters: [],
    isLoadingPreview: false,
    previewImage: null,
    previewSettings: {
      dpmm: "8dpmm",
      height: "6",
      index: "0",
      unit: "mm",
      width: "4",
    },
    printCount: 1,
    qzStatus: "disconnected",
    rawZplCode: "",
    selectedPrinter: "",
  });

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev.slice(-49), message]);
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    });
  }, []);

  const loadPrinters = useCallback(async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      try {
        const printers = await window.qz.printers.find();
        setSettings((prev) => ({
          ...prev,
          availablePrinters: printers,
          selectedPrinter: printers.length > 0 ? printers[0] : "",
        }));
        addLog(`Found ${printers.length} printers`);
      } catch (error) {
        addLog(`Failed to load printers: ${error}`);
        toast.error("Failed to load printers");
      }
    }
  }, [addLog]);

  const initializeQZ = useCallback(async () => {
    if (typeof window === "undefined" || !window.qz) {
      toast.error("QZ Tray library not found");
      return false;
    }
    try {
      setSettings((prev) => ({ ...prev, qzStatus: "connecting" }));
      addLog("Connecting to QZ Tray...");

      await initializeSigning();
      await window.qz.websocket.connect();

      setSettings((prev) => ({ ...prev, qzStatus: "connected" }));
      addLog("Successfully connected to QZ Tray");

      await loadPrinters();
      return true;
    } catch (error) {
      setSettings((prev) => ({ ...prev, qzStatus: "error" }));
      addLog(`Failed to connect to QZ Tray: ${error}`);
      toast.error("Failed to connect to QZ Tray. Make sure QZ Tray is running.");
      return false;
    }
  }, [addLog, initializeSigning, loadPrinters]);

  const disconnectQZ = useCallback(async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      try {
        await window.qz.websocket.disconnect();
        setSettings((prev) => ({
          ...prev,
          availablePrinters: [],
          qzStatus: "disconnected",
          selectedPrinter: "",
        }));
        addLog("Disconnected from QZ Tray");
      } catch (error) {
        addLog(`Error disconnecting from QZ Tray: ${error}`);
      }
    }
  }, [addLog]);

  const printRaw = useCallback(
    async (zpl: string): Promise<boolean> => {
      if (!window.qz || !window.qz.websocket.isActive()) {
        toast.error("QZ Tray is not connected. Please connect first.");
        return false;
      }
      if (!settings.selectedPrinter) {
        toast.error("No printer selected");
        return false;
      }
      try {
        const config = window.qz.configs.create(settings.selectedPrinter, {
          forceRawMode: true,
        });
        await window.qz.print(config, [zpl]);
        return true;
      } catch (error) {
        addLog(`QZ Tray print error: ${error}`);
        toast.error(`Print error: ${error}`);
        return false;
      }
    },
    [addLog, settings.selectedPrinter]
  );

  const printBatch = useCallback(
    async (zplJobs: string[], jobDelayMs = 0): Promise<number> => {
      let printed = 0;
      for (let i = 0; i < zplJobs.length; i += 1) {
        const ok = await printRaw(zplJobs[i]);
        if (!ok) break;
        printed += 1;
        if (jobDelayMs > 0 && i < zplJobs.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, jobDelayMs));
        }
      }
      if (printed > 0) {
        addLog(`Printed ${printed}/${zplJobs.length} label(s)`);
      }
      return printed;
    },
    [addLog, printRaw]
  );

  const generatePreview = useCallback(
    async (resolvedZpl: string): Promise<boolean> => {
      const { dpmm, width, height, index, unit } = settings.previewSettings;
      if (!resolvedZpl.trim()) {
        toast.error("Please enter ZPL code to preview");
        return false;
      }
      if (!dpmm || !width || !height) {
        toast.error("Please fill in all preview settings");
        return false;
      }

      setSettings((prev) => ({
        ...prev,
        isLoadingPreview: true,
        previewImage: null,
      }));

      try {
        const widthInInches =
          unit === "mm" ? mmToInches(parseFloat(width)) : parseFloat(width);
        const heightInInches =
          unit === "mm" ? mmToInches(parseFloat(height)) : parseFloat(height);

        const apiUrl = `https://api.labelary.com/v1/printers/${dpmm}/labels/${widthInInches}x${heightInInches}/${index}/`;
        const response = await fetch(apiUrl, {
          body: resolvedZpl,
          headers: {
            Accept: "image/png",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(
            `Labelary API error: ${response.status} ${response.statusText}`
          );
        }

        const blob = await response.blob();
        setSettings((prev) => ({
          ...prev,
          isLoadingPreview: false,
          previewImage: URL.createObjectURL(blob),
        }));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`Preview generation failed: ${errorMessage}`);
        toast.error(`Preview error: ${errorMessage}`);
        setSettings((prev) => ({
          ...prev,
          isLoadingPreview: false,
          previewImage: null,
        }));
        return false;
      }
    },
    [addLog, settings.previewSettings]
  );

  const setPrinterSelection = useCallback(
    (printer: string) => {
      setSettings((prev) => ({ ...prev, selectedPrinter: printer }));
    },
    []
  );

  const setPrintCount = useCallback((count: number) => {
    setSettings((prev) => ({ ...prev, printCount: Math.max(1, count) }));
  }, []);

  const setRawZplCode = useCallback((code: string) => {
    setSettings((prev) => ({ ...prev, rawZplCode: code }));
  }, []);

  const setPreviewSettings = useCallback(
    (patch: Partial<FaTagPreviewSettings>) => {
      setSettings((prev) => ({
        ...prev,
        previewSettings: { ...prev.previewSettings, ...patch },
      }));
    },
    []
  );

  const clearPreviewImage = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      isLoadingPreview: false,
      previewImage: null,
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    clearLogs,
    clearPreviewImage,
    disconnectQZ,
    generatePreview,
    initializeQZ,
    logRef,
    logs,
    printBatch,
    printRaw,
    setPreviewSettings,
    setPrintCount,
    setPrinterSelection,
    setRawZplCode,
    settings,
  };
};

export default useFaTagPrint;
