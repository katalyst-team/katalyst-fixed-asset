"use client";

import { Plug, PlugZap, RefreshCw } from "lucide-react";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("fixed-assets");
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
          {t("reader.qzTitle")}
        </div>
        <span className={`ks-badge ${STATUS_LABEL[reader.status] ?? "outline"}`}>
          {reader.status}
        </span>
      </div>
      {reader.status === "unavailable" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("reader.qzUnavailable")}
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
              <option value="">{t("reader.selectPort")}</option>
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
              {t("reader.ports")}
            </button>
            {isConnected ? (
              <button
                className="ks-btn ks-btn-ghost ks-btn-sm"
                type="button"
                onClick={() => void reader.disconnect()}
              >
                {t("reader.disconnect")}
              </button>
            ) : (
              <button
                className="ks-btn ks-btn-primary ks-btn-sm"
                disabled={!reader.port || reader.status === "connecting"}
                type="button"
                onClick={() => void reader.connect(reader.port)}
              >
                <Plug size={13} />
                {t("reader.connect")}
              </button>
            )}
          </div>
          {reader.error && (
            <p className="mt-2 text-xs text-destructive">{reader.error}</p>
          )}
          {lastEpc && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {t("reader.lastRead", { epc: lastEpc })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
