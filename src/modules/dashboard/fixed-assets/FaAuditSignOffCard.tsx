"use client";

import { CheckCircle2, Clock } from "lucide-react";

import type {
  FaAuditSignOffEntry,
  FaAuditSignOffRole,
} from "@/types/fixed-assets";

const SIGNOFF_ROLES: { label: string; role: FaAuditSignOffRole }[] = [
  { label: "Stock count lead", role: "stock_count_lead" },
  { label: "Department head", role: "dept_head" },
  { label: "Internal audit", role: "internal_audit" },
  { label: "Finance manager", role: "finance_manager" },
  { label: "External accountant", role: "external_accountant" },
];

export const SIGNOFF_ROLE_COUNT = SIGNOFF_ROLES.length;

interface FaAuditSignOffCardProps {
  auditId: string;
  canManage: boolean;
  signOffByRole: Map<string, FaAuditSignOffEntry>;
  signoffDone: number;
  signoffRequired: number;
  onSignOff: (role: FaAuditSignOffRole) => void;
}

export function FaAuditSignOffCard({
  auditId,
  canManage,
  signOffByRole,
  signoffDone,
  signoffRequired,
  onSignOff,
}: FaAuditSignOffCardProps) {
  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <div>
          <div className="ks-card-title">Sign-off · Audit report</div>
          <div className="ks-card-desc">
            {signoffDone} of {signoffRequired} required approvals
          </div>
        </div>
        <span className="ks-badge warn">
          {Math.max(signoffRequired - signoffDone, 0)} pending
        </span>
      </div>
      <div
        className="ks-card-body"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {SIGNOFF_ROLES.map((s) => {
          const entry = signOffByRole.get(s.role);
          const done = Boolean(entry);
          return (
            <div
              key={s.role}
              style={{ alignItems: "center", display: "flex", gap: 10 }}
            >
              {done ? (
                <CheckCircle2
                  size={18}
                  style={{ color: "hsl(var(--success))", flexShrink: 0 }}
                />
              ) : (
                <Clock
                  size={18}
                  style={{ color: "hsl(var(--warn))", flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  {entry?.user_name || "Awaiting signature"}
                </div>
              </div>
              {done ? (
                <span className="ks-badge success">Signed</span>
              ) : canManage ? (
                <button
                  className="ks-btn ks-btn-primary ks-btn-sm"
                  disabled={!auditId}
                  type="button"
                  onClick={() => onSignOff(s.role)}
                >
                  Sign off
                </button>
              ) : (
                <span className="ks-badge outline">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
