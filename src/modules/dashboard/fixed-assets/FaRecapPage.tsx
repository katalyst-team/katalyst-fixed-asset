"use client";

import { FileSpreadsheet } from "lucide-react";
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
              { key: "asset_code", label: "Code" },
              { key: "name", label: "Name" },
              { formatter: (v) => CAT_LABEL[v as FaAsset["cat"]] ?? String(v), key: "cat", label: "Category" },
              { formatter: (v) => STATUS_LABEL[v as FaAsset["status"]] ?? String(v), key: "status", label: "Status" },
              { key: "loc", label: "Location" },
              { key: "custodian", label: "Custodian" },
              { key: "serial", label: "Serial" },
              { key: "epc", label: "EPC" },
              { key: "purchased", label: "Purchased" },
              { key: "val", label: "Value (IDR)" },
              { key: "warranty", label: "Warranty" },
              { key: "supplier", label: "Supplier" },
            ],
            data: assets,
            sheetName: "Assets",
          },
          {
            columns: [
              { key: "label", label: "Category" },
              { key: "n", label: "Assets" },
              { key: "v", label: "Value (IDR)" },
              { key: "pct", label: "Share (%)" },
            ],
            data: catStats.map((c) => ({
              label: CAT_LABEL[c.cat] ?? c.cat,
              n: c.n,
              pct: c.pct,
              v: c.v,
            })),
            sheetName: "Per category",
          },
          {
            columns: [
              { key: "n", label: "Site" },
              { key: "city", label: "City" },
              { key: "assets", label: "Assets" },
              { key: "val", label: "Value (IDR)" },
              { key: "pct", label: "Share (%)" },
              { key: "status", label: "Status" },
            ],
            data: sites,
            sheetName: "Per site",
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
            Export Excel
          </button>
        }
        desc="Asset totals, category breakdown, and site breakdown — exportable to Excel."
        title="Asset Recap"
      />

      <FaKpiStrip>
        <FaStat label="Total assets" tone="brand" value={String(data?.total_assets ?? "—")} />
        <FaStat label="Total acquisition" tone="info" value={data ? formatIDRShort(data.total_acquisition) : "—"} />
        <FaStat label="Net book value" tone="success" value={data ? formatIDRShort(data.net_book_value) : "—"} />
        <FaStat label="Utilization" sub="assets in use" tone="warn" value={data ? `${data.utilization_pct}%` : "—"} />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription="No recap data available yet."
        emptyTitle="Nothing to recap"
        isEmpty={catStats.length === 0 && sites.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Recap per category</div>
            </div>
            <div className="ks-card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Assets</th>
                    <th className="pb-2 text-right">Value</th>
                    <th className="pb-2 text-right">Share</th>
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
              <div className="ks-card-title">Recap per site</div>
            </div>
            <div className="ks-card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2">Site</th>
                    <th className="pb-2">City</th>
                    <th className="pb-2 text-right">Assets</th>
                    <th className="pb-2 text-right">Value</th>
                    <th className="pb-2 text-right">Share</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((s) => (
                    <tr
                      key={`${s.n}-${s.city}`}
                      className="border-t border-border"
                    >
                      <td className="py-2 font-medium">{s.n}</td>
                      <td className="py-2">{s.city}</td>
                      <td className="py-2 text-right">{s.assets}</td>
                      <td className="py-2 text-right">{formatIDRShort(s.val)}</td>
                      <td className="py-2 text-right">{s.pct}%</td>
                      <td className="py-2 text-right">
                        <span className={`ks-badge ${s.status === "on" ? "success" : "danger"}`}>
                          {s.status === "on" ? "active" : "offline"}
                        </span>
                      </td>
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
            <DialogTitle>Exporting recap</DialogTitle>
          </DialogHeader>
          <Progress value={progressPct} />
          <p className="text-sm text-muted-foreground">
            {progress?.phase === "write"
              ? "Generating Excel file…"
              : `Fetching assets ${progress?.done ?? 0}/${progress?.total ?? 0} (batches of ${BATCH_SIZE})…`}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
