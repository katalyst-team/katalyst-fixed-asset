"use client";

import { ChevronRight, Download, Filter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useBulkCreateAssetMutation,
  useBulkUpdateAssetMutation,
  useCreateAssetMutation,
  useExportDataMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import {
  avatarColor,
  catToLucide,
  catToneClass,
  formatIDRShort,
  initials,
} from "@/modules/dashboard/fixed-assets";
import {
  CAT_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { AssetCategory, AssetStatus } from "@/types/fixed-assets";

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const h = 20;
  const w = 56;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg height={h} width={w}>
      <polyline
        fill="none"
        points={pts}
        stroke="hsl(var(--brand))"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function FaRegisterPage() {
  const { t } = useTranslation("fixed-assets");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;

  const { data: resp, isError, isLoading } = useGetAssetRegisterQuery({
    cat: (cat || undefined) as AssetCategory | undefined,
    limit: PAGE_LIMIT,
    organizationId,
    page,
    q: q || undefined,
    status: (status || undefined) as AssetStatus | undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [cat, q, status]);
  const { mutateAsync: createAsset } = useCreateAssetMutation({ organizationId });
  const { mutateAsync: bulkCreateAsset } = useBulkCreateAssetMutation({ organizationId });
  const { mutateAsync: bulkUpdateAsset } = useBulkUpdateAssetMutation({ organizationId });
  const { isPending: isExporting, mutateAsync: exportData } = useExportDataMutation({ organizationId });
  const assets = useMemo(() => resp?.data?.assets ?? [], [resp]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (q) {
        const ql = q.toLowerCase();
        if (!a.name.toLowerCase().includes(ql) && !a.id.toLowerCase().includes(ql)) {
          return false;
        }
      }
      if (cat && a.cat !== cat) return false;
      if (status && a.status !== status) return false;
      return true;
    });
  }, [assets, q, cat, status]);

  const allChecked = filtered.length > 0 && filtered.every((a) => sel.has(a.id));

  const handleNext = () => {
    if (resp?.page_pagination?.has_next) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const toggleAll = () => {
    setSel(allChecked ? new Set() : new Set(filtered.map((a) => a.id)));
  };

  const toggleOne = (id: string) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const goDetail = (id: string) => {
    router.push(`/dashboard/fixed-assets/register/${id}/`);
  };

  const handleExport = async (assetIds?: string[]) => {
    const resp = await exportData({
      filters: { asset_ids: assetIds, cat, q, status },
      format: "csv",
      source: "assets",
    });
    if (resp?.data?.download_url) {
      safeOpenUrl(resp.data.download_url);
    }
  };

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("page.register.title")}</h1>
          <p className="ks-page-desc">{assets.length} {t("page.register.description")}</p>
        </div>
        <div className="ks-page-actions">
          {canManage && (
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => bulkCreateAsset({ assets: [] })}
            >
              <Upload size={14} />
              {t("actions.import")}
            </button>
          )}
          <button
            className="ks-btn ks-btn-sm"
            disabled={isExporting}
            type="button"
            onClick={() => handleExport()}
          >
            <Download size={14} />
            {t("actions.export")}
          </button>
          {canManage && (
            <button
              className="ks-btn ks-btn-primary ks-btn-sm"
              type="button"
              onClick={() =>
                createAsset({
                  cat: "furn",
                  custodian: "",
                  loc: "",
                  name: "",
                  purchased: "",
                  serial: "",
                  supplier: "",
                  val: 0,
                  warranty: "",
                })
              }
            >
              <Plus size={14} />
              {t("actions.add")}
            </button>
          )}
        </div>
      </div>

      <div className="ks-filterbar" style={{ marginBottom: 16 }}>
        <div className="ks-search-box" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={14} />
          <input
            placeholder={t("filters.searchPlaceholder")}
            style={{
              background: "transparent",
              border: 0,
              color: "hsl(var(--text))",
              flex: 1,
              fontFamily: "inherit",
              fontSize: 13,
              outline: 0,
            }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="ks-btn ks-btn-sm"
          style={{ appearance: "none" }}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">{t("filters.allCategories")}</option>
          {Object.entries(CAT_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="ks-btn ks-btn-sm"
          style={{ appearance: "none" }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("filters.allStatuses")}</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          className="ks-btn ks-btn-sm"
          type="button"
        >
          <Filter size={14} />
          {t("filters.more")}
        </button>
        <span className="text-xs text-muted-foreground" style={{ marginLeft: "auto" }}>
          {t("page.register.filteredOf", { filtered: filtered.length, total: assets.length })}
        </span>
      </div>

      {sel.size > 0 && (
        <div
          className="flex items-center gap-2"
          style={{
            background: "hsl(var(--brand-soft))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            marginBottom: 16,
            padding: "8px 16px",
          }}
        >
          <span className="text-sm font-semibold">{sel.size} selected</span>
          <div className="flex items-center gap-1" style={{ marginLeft: "auto" }}>
            {canManage && <button className="ks-btn ks-btn-sm" type="button" onClick={() => bulkUpdateAsset({ action: "transfer", asset_ids: [...sel], payload: {} })}>Transfer</button>}
            {canManage && <button className="ks-btn ks-btn-sm" type="button" onClick={() => bulkUpdateAsset({ action: "dispose", asset_ids: [...sel], payload: {} })}>Dispose</button>}
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Print labels · ${sel.size} assets`)}>Print</button>
            {canManage && <button className="ks-btn ks-btn-sm" type="button" onClick={() => bulkUpdateAsset({ action: "change-custodian", asset_ids: [...sel], payload: {} })}>Custodian</button>}
            <button className="ks-btn ks-btn-sm" disabled={isExporting} type="button" onClick={() => handleExport([...sel])}>Export</button>
            <button className="ks-btn ks-btn-ghost ks-btn-sm" type="button" onClick={() => setSel(new Set())}>Clear</button>
          </div>
        </div>
      )}

      <FaQueryState
        emptyDescription={t("page.register.noAssetsMatch")}
        emptyTitle={t("page.register.noAssetsFound")}
        isEmpty={filtered.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={7} rows={8} />}
      >
      <div className="ks-card">
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--surface-2))" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", width: 36 }}>
                  <input checked={allChecked} type="checkbox" onChange={() => toggleAll()} />
                </th>
                <th className="font-medium text-muted-foreground p-3 text-left">{t("page.register.columns.asset")}</th>
                <th className="font-medium text-muted-foreground p-3 text-left">{t("page.register.columns.category")}</th>
                <th className="font-medium text-muted-foreground p-3 text-left">{t("page.register.columns.location")}</th>
                <th className="font-medium text-muted-foreground p-3 text-left">{t("page.register.columns.custodian")}</th>
                <th className="font-medium text-muted-foreground p-3 text-right">{t("page.register.columns.valueNbv")}</th>
                <th className="font-medium text-muted-foreground p-3 text-left">{t("page.register.columns.status")}</th>
                <th className="font-medium text-muted-foreground p-3 text-center">{t("page.register.columns.activity")}</th>
                <th style={{ padding: "10px 12px", width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const Icon = catToLucide[a.cat] ?? catToLucide.furn;
                const isSel = sel.has(a.id);
                const nbv = a.val - a.dep;
                return (
                  <tr
                    key={a.id}
                    style={{
                      background: isSel ? "hsl(var(--brand-soft))" : undefined,
                      borderBottom: "1px solid hsl(var(--border))",
                      cursor: "pointer",
                    }}
                    onClick={() => goDetail(a.id)}
                  >
                    <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
                      <input checked={isSel} type="checkbox" onChange={() => toggleOne(a.id)} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} style={{ color: "hsl(var(--text-3))", flexShrink: 0 }} />
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`ks-badge ${catToneClass(a.cat)}`}>{CAT_LABEL[a.cat]}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{a.loc}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center text-xs font-semibold text-white"
                          style={{ background: avatarColor(idx), borderRadius: "50%", flexShrink: 0, height: 26, width: 26 }}
                        >
                          {initials(a.custodian)}
                        </span>
                        <span className="text-sm">{a.custodian}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="font-semibold">{formatIDRShort(a.val)}</div>
                      <div className="text-xs text-muted-foreground">NBV {formatIDRShort(nbv)}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`ks-badge ${STATUS_TONE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Sparkline data={a.spark} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <ChevronRight size={16} style={{ color: "hsl(var(--text-3))" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="justify-between text-xs text-muted-foreground flex items-center"
          style={{ borderTop: "1px solid hsl(var(--border))", padding: "10px 18px" }}
        >
          <span>{t("pagination.showing", { current: filtered.length, total: resp?.page_pagination?.total_records ?? 0 })}</span>
          <PaginationCursor
            currentPage={page}
            hasNextPage={resp?.page_pagination?.has_next ?? false}
            hasPrevPage={resp?.page_pagination?.has_prev ?? false}
            limit={PAGE_LIMIT}
            totalCount={resp?.page_pagination?.total_records ?? null}
            totalPages={resp?.page_pagination?.total_pages}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
