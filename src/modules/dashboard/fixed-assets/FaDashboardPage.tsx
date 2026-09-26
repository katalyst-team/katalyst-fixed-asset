"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  Truck,
  Upload,
  Wrench,
  Zap,
} from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { useUser } from "@/context/user-context";
import {
  useExportDataMutation,
  useGetAssetRegisterQuery,
  useGetCheckOutsQuery,
  useGetFADashboardQuery,
  useGetScanInHistoryQuery,
} from "@/hooks/api/fixed-assets";
import {
  activityIcon,
  activityTone,
  avatarColor,
  buildActivityHeatmap,
  catToLucide,
  FaKpiStrip,
  FaMeter,
  FaProtoIcon,
  FaShellHead,
  FaStat,
  formatActivityTime,
  formatIDRShort,
  heatOpacity,
  initials,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

const DAYS = ["page.dashboard.days.mon", "page.dashboard.days.tue", "page.dashboard.days.wed", "page.dashboard.days.thu", "page.dashboard.days.fri", "page.dashboard.days.sat", "page.dashboard.days.sun"];
const HEATMAP_SLOTS = ["page.dashboard.slots.s6", "page.dashboard.slots.s9", "page.dashboard.slots.s12", "page.dashboard.slots.s15", "page.dashboard.slots.s18", "page.dashboard.slots.s21"];

const QUICK_ACTIONS = [
  { href: "/dashboard/fixed-assets/scan-in/", icon: Download, labelKey: "page.dashboard.quick.scanIn" },
  { href: "/dashboard/fixed-assets/scan-out/", icon: Upload, labelKey: "page.dashboard.quick.scanOut" },
  { href: "/dashboard/fixed-assets/transfer/", icon: Truck, labelKey: "actions.transfer" },
  { href: "/dashboard/fixed-assets/audit/", icon: FileText, labelKey: "page.dashboard.quick.audit" },
  { href: "/dashboard/fixed-assets/maintenance/", icon: Wrench, labelKey: "page.dashboard.quick.workOrder" },
  { href: "/dashboard/fixed-assets/register/", icon: Plus, labelKey: "page.dashboard.quick.register" },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "page.dashboard.greeting.morning";
  if (hour < 18) return "page.dashboard.greeting.afternoon";
  return "page.dashboard.greeting.evening";
}

function rowBorder(isLast: boolean): string | undefined {
  return isLast ? undefined : "1px solid hsl(var(--border))";
}

export function FaDashboardPage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManage } = useFaPermission();
  const { data: resp, isError, isLoading } = useGetFADashboardQuery({ organizationId });
  const { data: assetResp } = useGetAssetRegisterQuery({ organizationId });
  const { data: checkOutResp } = useGetCheckOutsQuery({
    limit: 200,
    organizationId,
  });
  const { data: scanInHistoryResp } = useGetScanInHistoryQuery({
    limit: 200,
    organizationId,
  });
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });

  const handleExport = async () => {
    const exportResp = await exportData({ format: "csv", source: "dashboard" });
    if (exportResp?.data?.download_url) {
      safeOpenUrl(exportResp.data.download_url);
    }
  };

  const d = resp?.data;
  const activity = d?.activity ?? [];
  const category_stats = d?.category_stats ?? [];
  const financialCategories = d?.financial_categories ?? [];
  const maintenanceUpcoming = d?.maintenance_upcoming ?? [];
  const rfidReads = d?.rfid_reads ?? [];
  const sites = d?.sites ?? [];

  const allAssets = assetResp?.data ?? [];
  const totalAssets = d?.total_assets ?? 0;
  const capitalValue = d?.net_book_value ?? 0;
  const topValue = allAssets
    .filter((a) => a.val > 100_000_000)
    .sort((a, b) => b.val - a.val)
    .slice(0, 6);

  const heatmap = useMemo(
    () =>
      buildActivityHeatmap([
        ...(checkOutResp?.data?.check_outs ?? []).map((c) => c.out_date),
        ...(scanInHistoryResp?.data?.history ?? []).map((h) => h.deployed_at),
      ]),
    [checkOutResp, scanInHistoryResp],
  );
  const heatmapMax = Math.max(...heatmap.flat());
  const heatmapTotal = heatmap.flat().reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["fa"] })}
            >
              <RefreshCw size={14} />
              {t("page.dashboard.actions.refresh")}
            </button>
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                disabled={isExporting}
                type="button"
                onClick={handleExport}
              >
                <Download size={14} />
                {t("actions.export")}
              </button>
            )}
            <button
              className="ks-btn ks-btn-primary ks-btn-sm"
              type="button"
              onClick={() => router.push("/dashboard/fixed-assets/register/")}
            >
              <Plus size={14} />
              {t("actions.add")}
            </button>
          </>
        }
        desc={t("page.dashboard.headerDesc", { assets: totalAssets.toLocaleString(), sites: sites.length })}
        title={`${t(greeting())}, ${tokenPayload?.first_name ?? ""}`}
      />

      <FaKpiStrip>
        <FaStat label={t("page.dashboard.kpi.totalAssets")} tone="brand" value={String(totalAssets)} />
        <FaStat label={t("page.dashboard.kpi.capitalValue")} sub={t("page.dashboard.kpi.capitalValueSub")} tone="info" value={formatIDRShort(capitalValue)} />
        <FaStat label={t("page.dashboard.kpi.utilization")} sub={t("page.dashboard.kpi.utilizationSub")} tone="success" value={d ? `${Math.round(d.utilization_pct)}%` : "—"} />
        <FaStat label={t("page.dashboard.kpi.activeAlerts")} tone="danger" value={String(d?.active_alerts ?? 0)} />
        <FaStat
          label={t("page.dashboard.kpi.auditProgress")}
          tone="warn"
          value={d ? `${Math.round(d.audit_progress_pct)}%` : "—"}
        />
      </FaKpiStrip>

      <FaQueryState
        isEmpty={!d}
        isError={isError}
        isLoading={isLoading}
      >
      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.quickActions")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.quickActionsDesc")}</div>
            </div>
          </div>
          <div className="ks-card-body">
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.labelKey}
                    className="ks-btn"
                    style={{ justifyContent: "flex-start" }}
                    type="button"
                    onClick={() => router.push(qa.href)}
                  >
                    <Icon size={14} />
                    {t(qa.labelKey)}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 12 }}>
              <div
                className="rounded-lg border border-border p-3"
                style={{ background: "hsl(var(--brand-soft))" }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <Zap size={14} style={{ color: "hsl(var(--brand))" }} />
                  <span className="text-xs font-semibold">{t("page.dashboard.section.aiInsight")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("page.dashboard.aiInsightDesc")}
                </p>
              </div>
              <div
                className="rounded-lg border border-border p-3"
                style={{ background: "hsl(var(--danger-soft))" }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <FileText size={14} style={{ color: "hsl(var(--destructive))" }} />
                  <span className="text-xs font-semibold">{t("page.dashboard.section.lossPrevention")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("page.dashboard.lossPreventionDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.recentActivity")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.liveFeed")}</div>
            </div>
            <span className="ks-badge success">{t("page.dashboard.section.live")}</span>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {activity.map((it, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === activity.length - 1), padding: "10px 18px" }}
              >
                <span className={`ks-badge ${activityTone(it.action_type)}`} style={{ flexShrink: 0 }}>
                  <FaProtoIcon name={activityIcon(it.action_type)} />
                </span>
                <span className="flex-1 text-sm" style={{ color: "hsl(var(--text))" }}>
                  {it.description}
                </span>
                <span className="text-xs text-muted-foreground">{formatActivityTime(it.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ks-grid-3" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">{t("page.dashboard.section.categoryDistribution")}</div>
          </div>
          <div className="ks-card-body">
            {category_stats.map((cs) => {
              const Icon = catToLucide[cs.cat] ?? catToLucide.furn;
              return (
                <div key={cs.cat} style={{ marginBottom: 12 }}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: "hsl(var(--text-3))" }} />
                      <span className="text-sm">{CAT_LABEL[cs.cat] ?? cs.cat}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cs.v.toLocaleString()} · {cs.pct}%
                    </span>
                  </div>
                  <FaMeter pct={cs.pct} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.activityWeek")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.activityWeekDesc")}</div>
            </div>
          </div>
          <div className="ks-card-body">
            {heatmapTotal === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("page.dashboard.empty.noActivity")}
              </p>
            ) : (
              <>
                <div className="flex gap-1" style={{ marginBottom: 6 }}>
                  <span style={{ width: 28 }} />
                  {HEATMAP_SLOTS.map((h) => (
                    <span key={h} className="flex-1 text-center text-xs text-muted-foreground">{t(h)}</span>
                  ))}
                </div>
                {heatmap.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                    <span className="text-xs text-muted-foreground" style={{ width: 28 }}>{t(DAYS[ri])}</span>
                    {row.map((count, ci) => (
                      <div
                        key={ci}
                        className="flex-1"
                        style={{
                          background: `hsl(var(--brand) / ${heatOpacity(count, heatmapMax)})`,
                          borderRadius: 3,
                          height: 22,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">{t("page.dashboard.section.topValue")}</div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {topValue.map((a, i) => {
              const Icon = catToLucide[a.cat] ?? catToLucide.furn;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3"
                  style={{ borderBottom: rowBorder(i === topValue.length - 1), padding: "10px 18px" }}
                >
                  <Icon size={14} style={{ color: "hsl(var(--text-3))" }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{a.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{a.asset_code}</div>
                  </div>
                  <span className="font-mono text-sm font-semibold">{formatIDRShort(a.val)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.siteRollup")}</div>
              <div className="ks-card-desc">{t("page.dashboard.sitesCount", { count: sites.length })}</div>
            </div>
          </div>
          <div className="ks-card-body">
            <div className="grid grid-cols-3 gap-2">
              {sites.map((s) => (
                <div
                  key={s.n}
                  className="rounded-lg border border-border p-3"
                  style={{ background: "hsl(var(--surface))" }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold">{s.n}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm">{s.assets}</div>
                      <div className="text-xs text-muted-foreground">{formatIDRShort(s.val)}</div>
                    </div>
                    <span className="font-mono text-xs">{s.pct}%</span>
                  </div>
                  {s.sub && (
                    <div className="mt-1 text-xs" style={{ color: "hsl(var(--destructive))" }}>{s.sub}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.recentRfid")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.recentRfidDesc")}</div>
            </div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {rfidReads.map((r, i) => (
              <div
                key={r.epc}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === rfidReads.length - 1), padding: "10px 18px" }}
              >
                <span className="flex-1 text-sm">{r.asset}</span>
                <span className="font-mono text-xs text-muted-foreground">{r.epc}</span>
                <span className="text-xs text-muted-foreground">{r.reader_id ?? "—"}</span>
                <span
                  className="flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: avatarColor(i), borderRadius: "50%", height: 24, width: 24 }}
                >
                  {initials(r.custodian)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(r.last_read_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.financialSummary")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.financialSummaryDesc")}</div>
            </div>
          </div>
          <div className="ks-card-body">
            {financialCategories.map((fc) => (
              <div key={fc.cat} style={{ marginBottom: 14 }}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">{CAT_LABEL[fc.cat] ?? fc.cat}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatIDRShort(fc.nbv)} / {formatIDRShort(fc.cost)}
                  </span>
                </div>
                <FaMeter
                  pct={fc.pct}
                  tone={fc.pct >= 60 ? "success" : fc.pct >= 40 ? "brand" : "warn"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.dashboard.section.maintenance")}</div>
              <div className="ks-card-desc">{t("page.dashboard.section.maintenanceDesc")}</div>
            </div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {maintenanceUpcoming.map((m, i) => (
              <div
                key={`${m.asset_code}-${m.created_at}`}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === maintenanceUpcoming.length - 1), padding: "10px 18px" }}
              >
                <span
                  className={`ks-badge ${
                    m.priority === "critical" ? "danger" : m.priority === "high" ? "warn" : m.priority === "medium" ? "info" : "outline"
                  }`}
                  style={{ flexShrink: 0 }}
                >
                  {m.type}
                </span>
                <span className="flex-1 text-sm">{m.desc}</span>
                <div className="text-right">
                  <div className="font-mono text-xs">{formatActivityTime(m.created_at)}</div>
                  <div className="text-xs text-muted-foreground">{m.asset}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
