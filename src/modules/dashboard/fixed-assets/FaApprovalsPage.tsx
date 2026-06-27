"use client";

import { CheckCircle2, XCircle } from "lucide-react";
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
import type { ApprovalStatus, FaApprovalRequest } from "@/types/fixed-assets";

type FilterTab = "all" | ApprovalStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in-review", label: "In Review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const TYPE_LABEL: Record<string, string> = {
  acquisition: "Acquisition",
  disposal: "Disposal",
  maintenance: "Maintenance",
  revaluation: "Revaluation",
  transfer: "Transfer",
  "write-off": "Write-off",
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
  const { tokenPayload } = useUser();
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
    await reject({ reason: "Rejected from approval center", requestId });
  };

  return (
    <div>
      <FaShellHead
        desc="Multi-step approval workflows for disposals, transfers, acquisitions, and major asset changes"
        title="Approval Center"
      />

      <FaKpiStrip>
        <FaStat label="Pending" tone="brand" value={String(summary?.pending ?? 0)} />
        <FaStat label="In Review" tone="warn" value={String(summary?.in_review ?? 0)} />
        <FaStat label="Approved" tone="success" value={String(summary?.approved ?? 0)} />
        <FaStat label="Escalated" sub="needs attention" tone="danger" value={String(summary?.escalated ?? 0)} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <FaQueryState isEmpty={requests.length === 0} isError={isError} isLoading={isLoading}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Approval Requests</div>
              <div className="ks-card-desc">{requests.length} requests</div>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Type</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Title</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Requester</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Progress</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Status</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: "1px solid hsl(var(--border-soft))" }}>
                  <td className="p-3">
                    <span className="ks-badge outline">{TYPE_LABEL[req.type] ?? req.type}</span>
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
                    {(req.status === "pending" || req.status === "in-review") && (
                      <div className="flex gap-1">
                        <button className="ks-btn ks-btn-primary ks-btn-sm" type="button" onClick={() => handleApprove(req.id)}>
                          <CheckCircle2 size={12} />
                          Approve
                        </button>
                        <button className="ks-btn ks-btn-sm" type="button" onClick={() => handleReject(req.id)}>
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rules.length > 0 && (
          <div className="ks-card" style={{ marginTop: 16 }}>
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">Approval Rules</div>
                <div className="ks-card-desc">Configured workflow rules</div>
              </div>
            </div>
            <div className="ks-card-body">
              <div className="grid grid-cols-2 gap-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="border border-border p-3 rounded-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-sm">{rule.name}</span>
                      <span className={`ks-badge ${rule.is_active ? "success" : "outline"}`}>{rule.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="mb-2 text-muted-foreground text-xs">{TYPE_LABEL[rule.approval_type] ?? rule.approval_type}</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="ks-badge info">{rule.scope}</span>
                      <span className="ks-badge outline">{rule.workflow_steps.length} steps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </FaQueryState>
    </div>
  );
}
