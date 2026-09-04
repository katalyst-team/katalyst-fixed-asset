"use client";

import { Radio, RefreshCw, Square, Usb } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import useGetDesktopReaderStatusQuery from "@/hooks/api/desktop-reader/useGetDesktopReaderStatusQuery";
import { scanRfidsService } from "@/services/desktop-reader";

const SCAN_INTERVAL_MS = 250;

interface FaDesktopReaderPanelProps {
  onEpc: (epc: string) => void;
}

export function FaDesktopReaderPanel({ onEpc }: FaDesktopReaderPanelProps) {
  const {
    data: status,
    isError,
    isFetching,
    refetch,
  } = useGetDesktopReaderStatusQuery();
  const [scanning, setScanning] = useState(false);
  const [lastEpc, setLastEpc] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const onEpcRef = useRef(onEpc);
  onEpcRef.current = onEpc;

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stop, [stop]);

  const handleStart = () => {
    setScanning(true);
    timerRef.current = setInterval(async () => {
      try {
        const result = await scanRfidsService();
        result?.epcs?.forEach((epc) => {
          if (seenRef.current.has(epc)) return;
          seenRef.current.add(epc);
          setLastEpc(epc);
          onEpcRef.current(epc);
        });
      } catch {
        stop();
      }
    }, SCAN_INTERVAL_MS);
  };

  const connected = status?.connected === true;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Usb size={14} />
          RFID Reader · Desktop
        </div>
        <span className={`ks-badge ${connected ? "success" : "warn"}`}>
          {isError ? "unavailable" : (status?.status ?? "checking")}
        </span>
      </div>
      {connected ? (
        <div className="mt-2 flex items-center gap-2">
          {scanning ? (
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              type="button"
              onClick={stop}
            >
              <Square size={13} />
              Stop scan
            </button>
          ) : (
            <button
              className="ks-btn ks-btn-primary ks-btn-sm"
              type="button"
              onClick={handleStart}
            >
              <Radio size={13} />
              Start scan
            </button>
          )}
          {lastEpc && (
            <span className="font-mono text-xs text-muted-foreground">
              Last read: {lastEpc}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 text-xs text-muted-foreground">
            Desktop reader app not detected. Start it on this machine to scan
            tags.
          </p>
          <button
            className="ks-btn ks-btn-ghost ks-btn-sm"
            disabled={isFetching}
            type="button"
            onClick={() => void refetch()}
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
