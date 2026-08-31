/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useQZSigning } from "@/hooks/useQZSigning";

export type QZReaderStatus =
  | "unavailable"
  | "idle"
  | "connecting"
  | "connected"
  | "error";

const EPC_RE = /\b[0-9A-Fa-f]{24}\b/g;

const hexToAscii = (hex: string): string => {
  let out = "";
  for (let i = 0; i + 1 < hex.length; i += 2) {
    const code = parseInt(hex.slice(i, i + 2), 16);
    if (!Number.isNaN(code)) out += String.fromCharCode(code);
  }
  return out;
};

const extractEpCs = (text: string): string[] => {
  const matches = text.match(EPC_RE);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.toUpperCase()))];
};

export const useQZSerialRfid = (onEpc: (epc: string) => void) => {
  const { initializeSigning } = useQZSigning();
  const [status, setStatus] = useState<QZReaderStatus>("idle");
  const [ports, setPorts] = useState<string[]>([]);
  const [port, setPort] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bufferRef = useRef("");
  const onEpcRef = useRef(onEpc);
  const openPortRef = useRef<string | null>(null);

  useEffect(() => {
    onEpcRef.current = onEpc;
  }, [onEpc]);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).qz) {
      setStatus("unavailable");
    }
    return () => {
      const qz = (window as any).qz;
      if (qz && openPortRef.current) {
        qz.serial.closePort(openPortRef.current).catch(() => undefined);
        openPortRef.current = null;
      }
    };
  }, []);

  const flushBuffer = useCallback(() => {
    const buffered = bufferRef.current;
    bufferRef.current = "";
    const epCs = extractEpCs(buffered);
    epCs.forEach((epc) => onEpcRef.current(epc));
  }, []);

  const refreshPorts = useCallback(async () => {
    const qz = (window as any).qz;
    if (!qz) {
      setStatus("unavailable");
      return;
    }
    try {
      if (!qz.websocket.isActive()) {
        const signed = await initializeSigning();
        if (!signed) return;
        await qz.websocket.connect();
      }
      const found = (await qz.serial.findPorts()) as string[];
      setPorts(found);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to list serial ports");
    }
  }, [initializeSigning]);

  const connect = useCallback(
    async (selectedPort: string) => {
      const qz = (window as any).qz;
      if (!qz) {
        setStatus("unavailable");
        return;
      }
      if (!selectedPort) {
        setError("Select a serial port first");
        return;
      }
      setStatus("connecting");
      setError(null);
      try {
        const signed = await initializeSigning();
        if (!signed) {
          setStatus("error");
          setError("QZ signing failed to initialize");
          return;
        }
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect();
        }
        qz.serial.setSerialCallbacks({
          receiveData: (evt: unknown, stream?: unknown) => {
            const raw =
              typeof stream === "string"
                ? stream
                : typeof (evt as any)?.stream === "string"
                  ? (evt as any).stream
                  : "";
            if (!raw) return;
            bufferRef.current += hexToAscii(raw) || raw;
            if (bufferRef.current.length >= 24) flushBuffer();
          },
        });
        await qz.serial.openPort(selectedPort);
        openPortRef.current = selectedPort;
        setPort(selectedPort);
        setStatus("connected");
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Failed to open serial port");
      }
    },
    [initializeSigning, flushBuffer],
  );

  const disconnect = useCallback(async () => {
    const qz = (window as any).qz;
    try {
      if (qz && openPortRef.current) {
        await qz.serial.closePort(openPortRef.current);
      }
    } catch {
      // port already closed
    }
    openPortRef.current = null;
    flushBuffer();
    setStatus("idle");
  }, [flushBuffer]);

  return {
    connect,
    disconnect,
    error,
    port,
    ports,
    refreshPorts,
    setPort,
    status,
  };
};
