"use client";

import { FileSpreadsheet } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/context/user-context";
import { useGetFADashboardQuery } from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL, STATUS_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { getAssetRegisterService } from "@/services/fixed-assets";
import type { FaAsset } from "@/types/fixed-assets";
import { exportMultiSheetExcel } from "@/utils/exportUtils";

const BATCH_SIZE = 5000;

interface ExportProgress {
  done: number;
  phase: "fetch" | "write";
  total: number;
}

export function FaRecapPage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetFADashboardQuery({
    organizationId,
  });
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const data = resp?.data;
  const catStats = useMemo(() => data?.category_stats ?? [], [data]);
  const sites = useMemo(() => data?.sites ?? [], [data]);

  const fetchAllAssets = async (): Promise<FaAsset[]> => {
    const assets: FaAsset[] = [];
    let total = 0;
    let page = 1;
    setProgress({ done: 0, phase: "fetch", total: 0 });
    for (;;) {
      const batchResp = await getAssetRegisterService({
        limit: BATCH_SIZE,
        organizationId,
        page,
      });
      const batch = batchResp.data ?? [];
      assets.push(...batch);
      total = batchResp.page_pagination?.total_records ?? assets.length;
      setProgress({ done: assets.length, phase: "fetch", total });
      if (batch.length === 0 || !batchResp.page_pagination?.has_next) break;
      page += 1;
    }
    return assets;
  };

  const handleExport = async () => {
    try {
      const assets = await fetchAllAssets();
      setProgress({ done: assets.length, phase: "write", total: assets.length });
      await exportMultiSheetExcel({
        filename: `asset-recap_${new Date().toISOString().split("T")[0]}`,
        sheets: [
          {
            columns: [
              { key: "asset_code", label: t("page.recap.export.code") },
              { key: "name", label: t("page.recap.export.name") },
              { formatter: (v) => CAT_LABEL[v as FaAsset["cat"]] ?? String(v), key: "cat", label: t("page.recap.export.category") },
              { formatter: (v) => STATUS_LABEL[v as FaAsset["status"]] ?? String(v), key: "status", label: t("page.recap.export.status") },
              { key: "loc", label: t("page.recap.export.location") },
              { key: "custodian", label: t("page.recap.export.custodian") },
              { key: "serial", label: t("page.recap.export.serial") },
              { key: "epc", label: t("page.recap.export.epc") },
              { key: "purchased", label: t("page.recap.export.purchased") },
              { key: "val", label: t("page.recap.export.value") },
              { key: "warranty", label: t("page.recap.export.warranty") },
              { key: "supplier", label: t("page.recap.export.supplier") },
            ],
            data: assets,
            sheetName: t("page.recap.export.sheetAssets"),
          },
          {
            columns: [
              { key: "label", label: t("page.recap.export.category") },
              { key: "n", label: t("page.recap.export.assets") },
              { key: "v", label: t("page.recap.export.value") },
              { key: "pct", label: t("page.recap.export.share") },
            ],
            data: catStats.map((c) => ({
              label: CAT_LABEL[c.cat] ?? c.cat,
              n: c.n,
              pct: c.pct,
              v: c.v,
            })),
            sheetName: t("page.recap.export.sheetCategory"),
          },
          {
            columns: [
              { key: "n", label: t("page.recap.export.site") },
              { key: "city", label: t("page.recap.export.city") },
              { key: "assets", label: t("page.recap.export.assets") },
              { key: "val", label: t("page.recap.export.value") },
              { key: "pct", label: t("page.recap.export.share") },
            ],
            data: sites,
            sheetName: t("page.recap.export.sheetSite"),
          },
        ],
      });
    } finally {
      setProgress(null);
    }
  };

  const progressPct =
    progress === null
      ? 0
      : progress.phase === "write" || progress.total === 0
        ? 100
        : Math.min(100, Math.round((progress.done / progress.total) * 100));

  return (
    <div>
      <FaShellHead
        actions={
          <button
            className="ks-btn ks-btn-primary ks-btn-sm"
            disabled={isLoading || isError || progress !== null}
            type="button"
            onClick={handleExport}
          >
            <FileSpreadsheet size={14} />
            {t("page.recap.exportExcel")}
          </button>
        }
        desc={t("page.recap.desc")}
        title={t("page.recap.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.recap.kpi.totalAssets")} tone="brand" value={String(data?.total_assets ?? "—")} />
        <FaStat label={t("page.recap.kpi.totalAcquisition")} tone="info" value={data ? formatIDRShort(data.total_acquisition) : "—"} />
        <FaStat label={t("page.recap.kpi.nbv")} tone="success" value={data ? formatIDRShort(data.net_book_value) : "—"} />
        <FaStat label={t("page.recap.kpi.utilization")} sub={t("page.recap.kpi.utilizationSub")} tone="warn" value={data ? `${data.utilization_pct}%` : "—"} />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription={t("page.recap.emptyDesc")}
        emptyTitle={t("page.recap.emptyTitle")}
        isEmpty={catStats.length === 0 && sites.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.recap.perCategory")}</div>
            </div>
            <div className="ks-card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2">{t("page.register.columns.category")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.assets")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.value")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.share")}</th>
                  </tr>
                </thead>
                <tbody>
                  {catStats.map((c) => (
                    <tr
                      key={c.cat}
                      className="border-t border-border"
                    >
                      <td className="py-2 font-medium">{CAT_LABEL[c.cat] ?? c.cat}</td>
                      <td className="py-2 text-right">{c.n}</td>
                      <td className="py-2 text-right">{formatIDRShort(c.v)}</td>
                      <td className="py-2 text-right">{c.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.recap.perSite")}</div>
            </div>
            <div className="ks-card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2">{t("page.recap.columns.site")}</th>
                    <th className="pb-2">{t("page.recap.columns.city")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.assets")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.value")}</th>
                    <th className="pb-2 text-right">{t("page.recap.columns.share")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((s) => (
                    <tr
                      key={s.site_id}
                      className="border-t border-border"
                    >
                      <td className="py-2 font-medium">{s.n}</td>
                      <td className="py-2">{s.city}</td>
                      <td className="py-2 text-right">{s.assets}</td>
                      <td className="py-2 text-right">{formatIDRShort(s.val)}</td>
                      <td className="py-2 text-right">{s.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FaQueryState>

      <Dialog
        open={progress !== null}
        onOpenChange={(open) => {
          if (!open) return;
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.recap.exportingTitle")}</DialogTitle>
          </DialogHeader>
          <Progress value={progressPct} />
          <p className="text-sm text-muted-foreground">
            {progress?.phase === "write"
              ? t("page.recap.generating")
              : t("page.recap.fetching", { batch: BATCH_SIZE, done: progress?.done ?? 0, total: progress?.total ?? 0 })}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
