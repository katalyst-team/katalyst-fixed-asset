"use client";

import { Plug, PlugZap, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";

import { useQZSerialRfid } from "@/hooks/useQZSerialRfid";

const STATUS_LABEL: Record<string, string> = {
  connected: "success",
  connecting: "info",
  error: "danger",
  idle: "outline",
  unavailable: "warn",
};

interface FaRfidReaderPanelProps {
  onEpc: (epc: string) => void;
}

export function FaRfidReaderPanel({ onEpc }: FaRfidReaderPanelProps) {
  const [lastEpc, setLastEpc] = useState("");
  const reader = useQZSerialRfid(
    useCallback(
      (epc: string) => {
        setLastEpc(epc);
        onEpc(epc);
      },
      [onEpc],
    ),
  );
  const isConnected = reader.status === "connected";

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <PlugZap size={14} />
          RFID Reader · QZ Tray
        </div>
        <span className={`ks-badge ${STATUS_LABEL[reader.status] ?? "outline"}`}>
          {reader.status}
        </span>
      </div>
      {reader.status === "unavailable" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          QZ Tray not detected. Start QZ Tray on this machine to read tags from
          a serial RFID reader.
        </p>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2">
            <select
              className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-[hsl(var(--brand))]"
              disabled={isConnected}
              value={reader.port}
              onChange={(e) => reader.setPort(e.target.value)}
            >
              <option value="">Select port</option>
              {reader.ports.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              disabled={isConnected}
              type="button"
              onClick={() => void reader.refreshPorts()}
            >
              <RefreshCw size={13} />
              Ports
            </button>
            {isConnected ? (
              <button
                className="ks-btn ks-btn-ghost ks-btn-sm"
                type="button"
                onClick={() => void reader.disconnect()}
              >
                Disconnect
              </button>
            ) : (
              <button
                className="ks-btn ks-btn-primary ks-btn-sm"
                disabled={!reader.port || reader.status === "connecting"}
                type="button"
                onClick={() => void reader.connect(reader.port)}
              >
                <Plug size={13} />
                Connect
              </button>
            )}
          </div>
          {reader.error && (
            <p className="mt-2 text-xs text-destructive">{reader.error}</p>
          )}
          {lastEpc && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Last read: {lastEpc}
            </p>
          )}
        </>
      )}
    </div>
  );
}
