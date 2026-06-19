"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Search,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { ASSETS, SECURITY_ALERTS } from "@/services/fixed-assets/mock";

const ASSET_BY_ID = new Map(ASSETS.map((a) => [a.id, a]));

const SEV_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  low: "Low",
  medium: "Medium",
};

const SEV_TONE: Record<string, string> = {
  critical: "danger",
  high: "warn",
  low: "outline",
  medium: "info",
};

export function FaSecurityPage() {
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast.info("Open geofence rules")}
            >
              <Shield size={14} />
              Geofence rules
            </button>
            <button
              className="ks-btn ks-btn-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "hsl(var(--destructive))",
              }}
              type="button"
              onClick={() => toast.info("3 active alerts")}
            >
              <AlertTriangle size={14} />3 active alerts
            </button>
          </>
        }
        desc="Geofence violations · exit scans · CCTV correlation"
        title="Loss Prevention · Security"
      />

      <FaKpiStrip>
        <FaStat label="Active geofences" tone="brand" value="14" />
        <FaStat label="Alerts today" tone="danger" value="3" />
        <FaStat label="Missing >7d" tone="warn" value="4" />
        <FaStat label="Recovery rate" tone="success" value="94%" />
      </FaKpiStrip>

      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">Live alerts</div>
          <span className="ks-badge danger">3 active</span>
        </div>
        <div className="ks-card-body">
          <div className="flex flex-col gap-3">
            {SECURITY_ALERTS.map((alert) => {
              const asset = ASSET_BY_ID.get(alert.assetId);
              const critical = alert.severity === "critical";
              return (
                <div
                  key={alert.id}
                  style={{
                    background: critical
                      ? "rgba(239,68,68,0.06)"
                      : "hsl(var(--surface-2))",
                    border:
                      "1px solid " +
                      (critical
                        ? "rgba(239,68,68,0.3)"
                        : "hsl(var(--border))"),
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"ks-badge " + SEV_TONE[alert.severity]}>
                      {SEV_LABEL[alert.severity]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.time} · {alert.zone} · {alert.camera}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    {alert.asset}
                    <span className="font-normal text-muted-foreground">
                      {" · "}
                      {alert.assetId}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {alert.desc}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      Custodian:{" "}
                      <span className="font-medium text-foreground">
                        {asset?.custodian ?? "—"}
                      </span>
                    </span>
                    <span>
                      Value:{" "}
                      <span className="font-medium text-foreground">
                        {asset ? formatIDRShort(asset.val) : "—"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {critical && (
                      <button
                        className="ks-btn ks-btn-primary ks-btn-sm"
                        type="button"
                        onClick={() =>
                          toast.warning(
                            "Halting " + alert.assetId + " · paging security",
                          )
                        }
                      >
                        <Lock size={13} />
                        Halt + page security
                      </button>
                    )}
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => toast.info("Opening CCTV " + alert.camera)}
                    >
                      <Eye size={13} />
                      Review CCTV
                    </button>
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => toast.info("View asset " + alert.assetId)}
                    >
                      <Search size={13} />
                      View asset
                    </button>
                    <button
                      className="ks-btn ks-btn-ghost ks-btn-sm"
                      type="button"
                      onClick={() => toast.success("Marked resolved · " + alert.id)}
                    >
                      <CheckCircle2 size={13} />
                      Mark resolved
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
