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
import { useTranslation } from "next-i18next";
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
  critical: "page.security.sev.critical",
  high: "page.security.sev.high",
  low: "page.security.sev.low",
  medium: "page.security.sev.medium",
};

const SEV_TONE: Record<string, string> = {
  critical: "danger",
  high: "warn",
  low: "outline",
  medium: "info",
};

export function FaSecurityPage() {
  const { t } = useTranslation("fixed-assets");
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
  const assets = assetResp?.data ?? [];
  const cameras = camerasResp?.data?.cameras ?? [];
  const ASSET_BY_ID = new Map(assets.map((a) => [a.id, a]));
  const CAMERA_BY_NAME = new Map(cameras.map((c) => [c.name, c]));

  const handleOpenCCTV = (cameraName: string) => {
    const cam = CAMERA_BY_NAME.get(cameraName);
    if (cam?.stream_url) {
      safeOpenUrl(cam.stream_url);
    } else {
      toast.info(t("toasts.openingCctv", { camera: cameraName }));
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
                {t("page.security.geofenceRules")}
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
              <AlertTriangle size={14} />{t("page.security.activeAlerts", { count: totalAlerts })}
            </button>
          </>
        }
        desc={t("page.security.desc")}
        title={t("page.security.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.security.kpi.total")} tone="brand" value={String(totalAlerts)} />
        <FaStat label={t("page.security.kpi.critical")} tone="danger" value={String(summary?.critical ?? 0)} />
        <FaStat label={t("page.security.kpi.investigating")} tone="warn" value={String(summary?.investigating ?? 0)} />
        <FaStat label={t("page.security.kpi.resolutionRate")} tone="success" value={summary ? `${Math.round(summary.resolution_rate)}%` : "—"} />
      </FaKpiStrip>

      <FaQueryState
        isEmpty={alerts.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">{t("page.security.liveAlerts")}</div>
          <span className="ks-badge danger">{t("page.security.activeCount", { count: alerts.length })}</span>
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
                      {t(SEV_LABEL[alert.severity])}
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
                      {t("page.security.custodian")}{" "}
                      <span className="font-medium text-foreground">
                        {asset?.custodian ?? "—"}
                      </span>
                    </span>
                    <span>
                      {t("page.security.value")}{" "}
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
                        {t("page.security.halt")}
                      </button>
                    )}
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => handleOpenCCTV(alert.camera)}
                    >
                      <Eye size={13} />
                      {t("page.security.reviewCctv")}
                    </button>
                    <button
                      className="ks-btn ks-btn-sm"
                      type="button"
                      onClick={() => router.push(`/dashboard/fixed-assets/register/${alert.asset_id}/`)}
                    >
                      <Search size={13} />
                      {t("page.security.viewAsset")}
                    </button>
                    {canManage && (
                      <button
                        className="ks-btn ks-btn-ghost ks-btn-sm"
                        type="button"
                        onClick={() =>
                          resolveAlert({
                            alertId: alert.id,
                            resolution_notes: t("page.security.resolvedNote"),
                          })
                        }
                      >
                        <CheckCircle2 size={13} />
                        {t("page.security.markResolved")}
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
