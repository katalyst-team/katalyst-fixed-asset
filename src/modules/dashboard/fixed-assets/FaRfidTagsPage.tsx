"use client";

import { CheckCircle2, Download, Plus, Printer, Search, Tag } from "lucide-react";
import { toast } from "sonner";

import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import { RFID_TAGS } from "@/services/fixed-assets/mock";

const STATUS_TONE: Record<string, string> = {
  active: "success",
  inactive: "outline",
  lost: "danger",
};

const rssiTone = (rssi: number): string =>
  rssi >= -50
    ? "hsl(var(--success))"
    : rssi >= -58
      ? "hsl(var(--warn))"
      : "hsl(var(--destructive))";

export function FaRfidTagsPage() {
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast.info("Print queue · 24 tags")}
            >
              <Printer size={14} />
              Print queue
            </button>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast.info("Open tag order form")}
            >
              <Plus size={14} />
              Order tags
            </button>
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              type="button"
              onClick={() => toast.success("Exporting tag register…")}
            >
              <Download size={14} />
              Export
            </button>
          </>
        }
        desc="Encode, print and track EPC / TID identifiers across the fleet"
        title="RFID Tags · Register & Print"
      />

      <FaKpiStrip>
        <FaStat label="Active tags" tone="brand" value="12,396" />
        <FaStat label="Inactive" tone="info" value="24" />
        <FaStat label="Lost" tone="danger" value="18" />
        <FaStat label="Print queue" sub="Zebra ZD621" tone="warn" value="24" />
      </FaKpiStrip>

      <div className="ks-card">
        <div className="ks-card-head">
          <div className="flex items-center gap-2">
            <Tag size={14} />
            <div className="ks-card-title">RFID tags</div>
          </div>
          <div className="ks-search-box">
            <Search size={14} />
            Search EPC / asset
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  EPC
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Asset
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Format
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  TID
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Last read
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  RSSI
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Print status
                </th>
              </tr>
            </thead>
            <tbody>
              {RFID_TAGS.map((tag) => (
                <tr key={tag.id}>
                  <td className="border-t border-border p-3 font-mono text-xs">
                    {tag.epc}
                  </td>
                  <td className="border-t border-border p-3">
                    <div className="font-medium">{tag.asset}</div>
                    <div className="text-xs text-muted-foreground">
                      {tag.assetId}
                    </div>
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.format}
                  </td>
                  <td className="border-t border-border p-3 font-mono text-xs text-muted-foreground">
                    {tag.tid}
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.lastRead}
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.rssi === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: rssiTone(tag.rssi) }}
                      >
                        {tag.rssi} dBm
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    <span className={"ks-badge " + STATUS_TONE[tag.status]}>
                      {tag.status}
                    </span>
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.printed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 size={13} />
                        Printed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Printer size={13} />
                        Queued
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
