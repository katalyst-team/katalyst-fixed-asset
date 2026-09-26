"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "next-i18next";

import type {
  FaAuditSignOffEntry,
  FaAuditSignOffRole,
} from "@/types/fixed-assets";

const SIGNOFF_ROLES: { label: string; role: FaAuditSignOffRole }[] = [
  { label: "ui.signoff.roles.stockCountLead", role: "stock_count_lead" },
  { label: "ui.signoff.roles.deptHead", role: "dept_head" },
  { label: "ui.signoff.roles.internalAudit", role: "internal_audit" },
  { label: "ui.signoff.roles.financeManager", role: "finance_manager" },
  { label: "ui.signoff.roles.externalAccountant", role: "external_accountant" },
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
  const { t } = useTranslation("fixed-assets");
  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <div>
          <div className="ks-card-title">{t("ui.signoff.title")}</div>
          <div className="ks-card-desc">
            {t("ui.signoff.approvals", { done: signoffDone, required: signoffRequired })}
          </div>
        </div>
        <span className="ks-badge warn">
          {t("ui.signoff.pendingCount", { n: Math.max(signoffRequired - signoffDone, 0) })}
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
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t(s.label)}</div>
                <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  {entry?.user_name || t("ui.signoff.awaiting")}
                </div>
              </div>
              {done ? (
                <span className="ks-badge success">{t("ui.signoff.signed")}</span>
              ) : canManage ? (
                <button
                  className="ks-btn ks-btn-primary ks-btn-sm"
                  disabled={!auditId}
                  type="button"
                  onClick={() => onSignOff(s.role)}
                >
                  {t("ui.signoff.signOff")}
                </button>
              ) : (
                <span className="ks-badge outline">{t("ui.signoff.pending")}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
