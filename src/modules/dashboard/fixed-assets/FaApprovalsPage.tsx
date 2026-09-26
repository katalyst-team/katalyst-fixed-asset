"use client";

import { CheckCircle2, Plus, XCircle } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useApproveRequestMutation,
  useGetApprovalRequestsQuery,
  useGetApprovalRulesQuery,
  useRejectRequestMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals/FaModalContext";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { ApprovalStatus, FaApprovalRequest } from "@/types/fixed-assets";

type FilterTab = "all" | ApprovalStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "page.approvals.tabs.all" },
  { id: "pending", label: "page.approvals.tabs.pending" },
  { id: "in-review", label: "page.approvals.tabs.inReview" },
  { id: "approved", label: "page.approvals.tabs.approved" },
  { id: "rejected", label: "page.approvals.tabs.rejected" },
];

const TYPE_LABEL: Record<string, string> = {
  acquisition: "page.approvals.types.acquisition",
  disposal: "page.approvals.types.disposal",
  maintenance: "page.approvals.types.maintenance",
  revaluation: "page.approvals.types.revaluation",
  transfer: "page.approvals.types.transfer",
  "write-off": "page.approvals.types.writeOff",
};

const STATUS_TONE: Record<string, string> = {
  approved: "success",
  escalated: "danger",
  "in-review": "warn",
  pending: "info",
  rejected: "danger",
  withdrawn: "outline",
};

function stepProgress(req: FaApprovalRequest): number {
  if (req.steps.length === 0) return 0;
  return Math.round((req.current_step / req.steps.length) * 100);
}

export function FaApprovalsPage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const { openModal } = useFaModal();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [tab, setTab] = useState<FilterTab>("all");
  const status = tab === "all" ? undefined : tab;

  const { data: resp, isError, isLoading } = useGetApprovalRequestsQuery({
    organizationId,
    status,
  });
  const { data: rulesResp } = useGetApprovalRulesQuery({ organizationId });
  const { mutateAsync: approve } = useApproveRequestMutation({ organizationId });
  const { mutateAsync: reject } = useRejectRequestMutation({ organizationId });

  const summary = resp?.data?.summary;
  const requests = resp?.data?.requests ?? [];
  const rules = rulesResp?.data?.rules ?? [];

  const handleApprove = async (requestId: string) => {
    await approve({ requestId });
  };
  const handleReject = async (requestId: string) => {
    await reject({ reason: t("page.approvals.rejectReason"), requestId });
  };

  return (
    <div>
      <FaShellHead
        desc={t("page.approvals.desc")}
        title={t("page.approvals.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.approvals.tabs.pending")} tone="brand" value={String(summary?.pending ?? 0)} />
        <FaStat label={t("page.approvals.tabs.inReview")} tone="warn" value={String(summary?.in_review ?? 0)} />
        <FaStat label={t("page.approvals.tabs.approved")} tone="success" value={String(summary?.approved ?? 0)} />
        <FaStat label={t("page.approvals.kpi.escalated")} sub={t("page.approvals.kpi.needsAttention")} tone="danger" value={String(summary?.escalated ?? 0)} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((tb) => (
          <button key={tb.id} className={tab === tb.id ? "on" : ""} type="button" onClick={() => setTab(tb.id)}>
            {t(tb.label)}
          </button>
        ))}
      </div>

      <FaQueryState isEmpty={requests.length === 0} isError={isError} isLoading={isLoading}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.approvals.requestsTitle")}</div>
              <div className="ks-card-desc">{t("page.approvals.requestsCount", { count: requests.length })}</div>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.approvals.columns.type")}</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.approvals.columns.title")}</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.approvals.columns.requester")}</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.approvals.columns.progress")}</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.register.columns.status")}</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("page.approvals.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: "1px solid hsl(var(--border-soft))" }}>
                  <td className="p-3">
                    <span className="ks-badge outline">{t(TYPE_LABEL[req.type] ?? req.type)}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-sm">{req.title}</div>
                    {req.description && <div className="text-muted-foreground text-xs">{req.description}</div>}
                  </td>
                  <td className="p-3 font-mono text-xs">{req.requester_id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, minWidth: 60 }}>
                        <div style={{ background: "hsl(var(--surface-2))", borderRadius: 4, height: 5, overflow: "hidden" }}>
                          <div style={{ background: "hsl(var(--brand))", borderRadius: 4, height: "100%", width: `${stepProgress(req)}%` }} />
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs">{req.current_step}/{req.steps.length}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`ks-badge ${STATUS_TONE[req.status] ?? "outline"}`}>{req.status}</span>
                  </td>
                  <td className="p-3">
                    {canManage && (req.status === "pending" || req.status === "in-review") && (
                      <div className="flex gap-1">
                        <button className="ks-btn ks-btn-primary ks-btn-sm" type="button" onClick={() => handleApprove(req.id)}>
                          <CheckCircle2 size={12} />
                          {t("actions.approve")}
                        </button>
                        <button className="ks-btn ks-btn-sm" type="button" onClick={() => handleReject(req.id)}>
                          <XCircle size={12} />
                          {t("actions.reject")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ks-card" style={{ marginTop: 16 }}>
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.approvals.rulesTitle")}</div>
              <div className="ks-card-desc">{t("page.approvals.rulesDesc")}</div>
            </div>
            {canManage && (
              <button
                className="ks-btn ks-btn-sm ks-btn-primary"
                type="button"
                onClick={() => openModal("approvalRule")}
              >
                <Plus size={12} />
                {t("page.approvals.newRule")}
              </button>
            )}
          </div>
          <div className="ks-card-body">
            {rules.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                {t("page.approvals.noRules")}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="border border-border p-3 rounded-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-sm">{rule.name}</span>
                      <span className={`ks-badge ${rule.is_active ? "success" : "outline"}`}>{rule.is_active ? t("page.approvals.active") : t("page.approvals.inactive")}</span>
                    </div>
                    <div className="mb-2 text-muted-foreground text-xs">{t(TYPE_LABEL[rule.approval_type] ?? rule.approval_type)}</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="ks-badge info">{rule.scope}</span>
                      <span className="ks-badge outline">{t("page.approvals.stepsCount", { count: rule.workflow_steps.length })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FaQueryState>
    </div>
  );
}
