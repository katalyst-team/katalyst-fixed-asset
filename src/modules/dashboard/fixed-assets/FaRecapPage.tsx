"use client";

import { FileSpreadsheet } from "lucide-react";
import { useMemo } from "react";

import { useUser } from "@/context/user-context";
import { useGetFADashboardQuery } from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { exportMultiSheetExcel } from "@/utils/exportUtils";

export function FaRecapPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetFADashboardQuery({
    organizationId,
  });

  const data = resp?.data;
  const catStats = useMemo(() => data?.category_stats ?? [], [data]);
  const sites = useMemo(() => data?.sites ?? [], [data]);

  const handleExport = async () => {
    await exportMultiSheetExcel({
      filename: `asset-recap_${new Date().toISOString().split("T")[0]}`,
      sheets: [
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
  };

  return (
    <div>
      <FaShellHead
        actions={
          <button
            className="ks-btn ks-btn-primary ks-btn-sm"
            disabled={isLoading || isError || (catStats.length === 0 && sites.length === 0)}
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
    </div>
  );
}
