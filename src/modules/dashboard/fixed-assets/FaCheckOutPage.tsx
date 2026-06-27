"use client";

import { Clock, Download, History, Plus } from "lucide-react";
import { useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useExportDataMutation,
  useGetCheckOutsQuery,
  useReturnCheckOutMutation,
} from "@/hooks/api/fixed-assets";
import {
  avatarColor,
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";

const STATUS_TONE: Record<string, string> = {
  active: "info",
  overdue: "danger",
  returned: "success",
};

const CONDITION_TONE: Record<string, string> = {
  excellent: "success",
  fair: "warn",
  good: "brand",
};

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FaCheckOutPage() {
  const { openModal } = useFaModal();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;
  const { data: resp, isError, isLoading } = useGetCheckOutsQuery({
    limit: PAGE_LIMIT,
    organizationId,
    page,
  });
  const { mutateAsync: returnAsset } = useReturnCheckOutMutation({
    organizationId,
  });
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });
  const check_outs = resp?.data?.check_outs ?? [];
  const activeLoans = check_outs.filter((c) => c.status === "active").length;
  const overdueLoans = check_outs.filter((c) => c.status === "overdue").length;
  const returnedLoans = check_outs.filter((c) => c.status === "returned").length;
  const returnRate = check_outs.length > 0 ? Math.round((returnedLoans / check_outs.length) * 100) : null;

  const handleNext = () => {
    if (page < (resp?.pagination?.total_pages ?? 1)) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleExport = async () => {
    const resp = await exportData({ format: "csv", source: "check-outs" });
    if (resp?.data?.download_url) {
      safeOpenUrl(resp.data.download_url);
    }
  };

  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
            >
              <History size={15} />
              History
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => openModal("checkout")}
            >
              <Plus size={15} />
              New check-out
            </button>
          </>
        }
        desc="Loan tools and equipment with RFID custody tracking"
        title="Check-Out · Asset Loans"
      />

      <FaKpiStrip>
        <FaStat label="Active loans" tone="info" value={String(activeLoans)} />
        <FaStat label="Overdue" sub="needs action" tone="danger" value={String(overdueLoans)} />
        <FaStat label="Return rate" tone="success" value={returnRate !== null ? `${returnRate}%` : "—"} />
        <FaStat label="Avg duration" tone="brand" value="—" />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription="No check-out records yet."
        emptyTitle="No check-outs"
        isEmpty={check_outs.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={7} rows={6} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div>
            <div className="ks-card-title">Check-Out Records</div>
            <div className="ks-card-desc">
              {check_outs.length} loans · RFID-verified chain of custody
            </div>
          </div>
          <button
            className="ks-btn ks-btn-sm"
            disabled={isExporting}
            type="button"
            onClick={handleExport}
          >
            <Download size={13} />
            Export
          </button>
        </div>
        <div className="ks-card-body">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium text-muted-foreground p-3">Asset</th>
                <th className="text-left font-medium text-muted-foreground p-3">Borrower</th>
                <th className="text-left font-medium text-muted-foreground p-3">Out date</th>
                <th className="text-left font-medium text-muted-foreground p-3">Due date</th>
                <th className="text-left font-medium text-muted-foreground p-3">Purpose</th>
                <th className="text-left font-medium text-muted-foreground p-3">Condition</th>
                <th className="text-left font-medium text-muted-foreground p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {check_outs.map((c, i) => {
                const Icon = catToLucide[
                  c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn"
                ];
                return (
                  <tr key={c.id} className="hover:bg-muted">
                    <td className="p-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        <div>
                          <div className="font-medium">{c.asset}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{c.asset_id}</span>
                            <span className={`ks-badge ${catToneClass(c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn")}`}>
                              {CAT_LABEL[c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn"]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: avatarColor(i) }}
                          title={c.by}
                        >
                          {c.by.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <span>{c.by}</span>
                      </div>
                    </td>
                    <td className="p-3 border-t border-border text-muted-foreground">{c.out_date}</td>
                    <td className="p-3 border-t border-border">
                      <span className={c.status === "overdue" ? "font-medium text-[hsl(var(--destructive))]" : "text-muted-foreground"}>
                        {c.status === "overdue" && <Clock className="mr-1 inline" size={12} />}
                        {c.due_date}
                      </span>
                    </td>
                    <td className="p-3 border-t border-border text-muted-foreground">{c.purpose}</td>
                    <td className="p-3 border-t border-border">
                      <span className={`ks-badge ${CONDITION_TONE[c.condition] ?? "outline"}`}>
                        {c.condition}
                      </span>
                    </td>
                    <td className="p-3 border-t border-border">
                      <span className={`ks-badge ${STATUS_TONE[c.status] ?? "outline"}`}>
                        {statusLabel(c.status)}
                      </span>
                      {c.status === "active" && (
                        <button
                          className="ml-2 text-xs text-[hsl(var(--brand))] hover:underline"
                          type="button"
                          onClick={() =>
                            returnAsset({
                              checkOutId: c.id,
                              data: {
                                condition: c.condition,
                                return_date: new Date().toISOString(),
                              },
                            })
                          }
                        >
                          Return
                        </button>
                      )}
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
          <span>Showing {check_outs.length} of {resp?.pagination?.count ?? 0}</span>
          <PaginationCursor
            currentPage={page}
            hasNextPage={page < (resp?.pagination?.total_pages ?? 1)}
            hasPrevPage={page > 1}
            limit={PAGE_LIMIT}
            totalCount={resp?.pagination?.total_count ?? null}
            totalPages={resp?.pagination?.total_pages}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
