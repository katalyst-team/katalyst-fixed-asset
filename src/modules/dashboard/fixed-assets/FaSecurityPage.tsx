"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Search,
  Shield,
} from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import {
  useCreateGeofenceRuleMutation,
  useGetAssetRegisterQuery,
  useGetCamerasQuery,
  useGetSecurityAlertsQuery,
  useHaltSecurityAlertMutation,
  useResolveSecurityAlertMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

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
  const router = useRouter();
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: alertResp, isError, isLoading } = useGetSecurityAlertsQuery({ organizationId });
  const { data: assetResp } = useGetAssetRegisterQuery({ organizationId });
  const { data: camerasResp } = useGetCamerasQuery({ organizationId });
  const { mutateAsync: haltAlert } = useHaltSecurityAlertMutation({
    organizationId,
  });
  const { mutateAsync: resolveAlert } = useResolveSecurityAlertMutation({
    organizationId,
  });
  const { mutateAsync: createGeofenceRule } = useCreateGeofenceRuleMutation({
    organizationId,
  });
  const alerts = alertResp?.data?.alerts ?? [];
  const summary = alertResp?.data?.summary;
  const totalAlerts = summary?.total ?? alerts.length;
  const assets = assetResp?.data?.assets ?? [];
  const cameras = camerasResp?.data?.cameras ?? [];
  const ASSET_BY_ID = new Map(assets.map((a) => [a.id, a]));
  const CAMERA_BY_NAME = new Map(cameras.map((c) => [c.name, c]));

  const handleOpenCCTV = (cameraName: string) => {
    const cam = CAMERA_BY_NAME.get(cameraName);
    if (cam?.stream_url) {
      safeOpenUrl(cam.stream_url);
    } else {
      toast.info("Opening CCTV " + cameraName);
    }
  };

  const handleGeofenceRules = async () => {
    await createGeofenceRule({
      rules: [
        { allowed_zones: ["BDG-WH", "JKT-HQ"], asset_category: "veh" },
      ],
    });
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                type="button"
                onClick={handleGeofenceRules}
              >
                <Shield size={14} />
                Geofence rules
              </button>
            )}
            <button
              className="ks-btn ks-btn-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "hsl(var(--destructive))",
              }}
              type="button"
            >
              <AlertTriangle size={14} />{totalAlerts} active alerts
            </button>
          </>
        }
        desc="Geofence violations · exit scans · CCTV correlation"
        title="Loss Prevention · Security"
      />

      <FaKpiStrip>
        <FaStat label="Total alerts" tone="brand" value={String(totalAlerts)} />
        <FaStat label="Critical" tone="danger" value={String(summary?.critical ?? 0)} />
        <FaStat label="Investigating" tone="warn" value={String(summary?.investigating ?? 0)} />
        <FaStat label="Resolution rate" tone="success" value={summary ? `${Math.round(summary.resolution_rate)}%` : "—"} />
      </FaKpiStrip>

      <FaQueryState
        isEmpty={alerts.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">Live alerts</div>
          <span className="ks-badge danger">{alerts.length} active</span>
        </div>
        <div className="ks-card-body">
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => {
              const asset = ASSET_BY_ID.get(alert.asset_id);
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
                      {alert.asset_id}
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
                    {critical && canManage && (
                      <button
                        className="ks-btn ks-btn-primary ks-btn-sm"
                        type="button"
                        onClick={() =>
                          haltAlert({ alertId: alert.id })
                        }
                      >
                        <Lock size={13} />
                        Halt + page security
                      </button>
                    )}
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => handleOpenCCTV(alert.camera)}
                    >
                      <Eye size={13} />
                      Review CCTV
                    </button>
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => router.push(`/dashboard/fixed-assets/register/${alert.asset_id}/`)}
                    >
                      <Search size={13} />
                      View asset
                    </button>
                    {canManage && (
                      <button
                        className="ks-btn ks-btn-ghost ks-btn-sm"
                        type="button"
                        onClick={() =>
                          resolveAlert({
                            alertId: alert.id,
                            resolution_notes: "Resolved by operator",
                          })
                        }
                      >
                        <CheckCircle2 size={13} />
                        Mark resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
