"use client";

import { Calendar, Download, FileText, Play, Shield } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import {
  useGetBastDocumentsQuery,
  useGetDepreciationScheduleQuery,
  useGetFADashboardQuery,
  useGetInsurancePoliciesQuery,
  useGetJournalEntriesQuery,
  usePostJournalEntryMutation,
  useRunDepreciationMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaMeter,
  FaShellHead,
  FaStat,
  formatIDR,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

type Tab = "depreciation" | "journal" | "bast" | "insurance";

const TABS: { id: Tab; label: string }[] = [
  { id: "depreciation", label: "page.finance.tabs.depreciation" },
  { id: "journal", label: "page.finance.tabs.journal" },
  { id: "bast", label: "page.finance.tabs.bast" },
  { id: "insurance", label: "page.finance.tabs.insurance" },
];

function DepreciationTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp, isError, isLoading } = useGetDepreciationScheduleQuery({ organizationId });
  const schedules = resp?.data?.schedules ?? [];
  const { canManage } = useFaPermission();
  const { isPending: isRunning, mutateAsync: runDepreciation } = useRunDepreciationMutation({ organizationId });

  const handleRunDepreciation = async () => {
    await runDepreciation();
  };

  return (
    <FaQueryState isEmpty={schedules.length === 0} isError={isError} isLoading={isLoading}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="text-xs text-muted-foreground">
          {t("page.finance.depreciation.count", { count: schedules.length })}
        </div>
        {canManage && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="ks-btn ks-btn-sm ks-btn-primary"
                disabled={isRunning}
                type="button"
              >
                <Play size={12} />
                {isRunning ? t("page.finance.depreciation.posting") : t("page.finance.depreciation.run")}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("page.finance.depreciation.confirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("page.finance.depreciation.confirmDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("page.finance.depreciation.cancel")}</AlertDialogCancel>
                <Button onClick={handleRunDepreciation}>{t("page.finance.depreciation.run")}</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.register.columns.asset")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.register.columns.category")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.depreciation.columns.method")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.depreciation.columns.acquisition")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.depreciation.columns.monthly")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.kpi.nbv")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.depreciation.columns.progress")}</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((sch) => (
            <tr key={sch.assetId} style={{ borderBottom: "1px solid hsl(var(--border-soft))" }}>
              <td className="p-3">
                <div className="font-semibold text-sm">{sch.assetName}</div>
                <div className="text-xs text-muted-foreground font-mono">{sch.assetId}</div>
              </td>
              <td className="p-3 text-sm">{CAT_LABEL[sch.cat] ?? sch.cat}</td>
              <td className="p-3 text-sm">{sch.depreciationMethod}</td>
              <td className="p-3 text-sm font-mono">{formatIDRShort(sch.depreciableBase)}</td>
              <td className="p-3 text-sm font-mono">{formatIDR(sch.monthlyDepreciation)}</td>
              <td className="p-3 text-sm font-mono font-semibold">{formatIDRShort(sch.netBookValue)}</td>
              <td className="p-3">
                <div style={{ minWidth: 80 }}>
                  <FaMeter pct={sch.usefulLife > 0 ? Math.round(((sch.usefulLife - sch.remainingLife) / sch.usefulLife) * 100) : 0} tone={sch.remainingLife < 12 ? "danger" : sch.remainingLife < 36 ? "warn" : "brand"} />
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("page.finance.depreciation.age", { age: sch.ageYears, life: sch.usefulLife })}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FaQueryState>
  );
}

function JournalTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp, isError, isLoading } = useGetJournalEntriesQuery({ organizationId });
  const entries = resp?.data?.journal_entries ?? [];
  const { canManage } = useFaPermission();
  const { isPending: isPosting, mutateAsync: postJournalEntry } = usePostJournalEntryMutation({ organizationId });

  const handlePost = async (journalEntryId: string) => {
    await postJournalEntry({ journalEntryId });
  };

  return (
    <FaQueryState isEmpty={entries.length === 0} isError={isError} isLoading={isLoading}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.reference")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.type")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.account")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.debit")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.credit")}</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.register.columns.status")}</th>
            <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("page.finance.journal.columns.action")}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} style={{ borderBottom: "1px solid hsl(var(--border-soft))" }}>
              <td className="p-3">
                <div className="font-mono text-sm font-semibold">{entry.reference}</div>
                <div className="text-xs text-muted-foreground">{entry.createdAt}</div>
              </td>
              <td className="p-3">
                <span className="ks-badge info">{entry.type}</span>
              </td>
              <td className="p-3 text-sm">
                <div className="font-mono">{entry.accountCode}</div>
                <div className="text-xs text-muted-foreground">{entry.accountName}</div>
              </td>
              <td className="p-3 text-sm font-mono">{entry.debit > 0 ? formatIDR(entry.debit) : "—"}</td>
              <td className="p-3 text-sm font-mono">{entry.credit > 0 ? formatIDR(entry.credit) : "—"}</td>
              <td className="p-3">
                <span className={`ks-badge ${entry.status === "posted" ? "success" : entry.status === "pending" ? "warn" : entry.status === "reversed" ? "danger" : "outline"}`}>
                  {entry.status}
                </span>
              </td>
              <td className="p-3 text-right">
                {canManage && entry.status === "pending" && (
                  <button
                    className="ks-btn ks-btn-sm"
                    disabled={isPosting}
                    type="button"
                    onClick={() => handlePost(entry.id)}
                  >
                    {t("page.finance.journal.post")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FaQueryState>
  );
}

function BastTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp, isError, isLoading } = useGetBastDocumentsQuery({ organizationId });
  const documents = resp?.data?.documents ?? [];

  return (
    <FaQueryState isEmpty={documents.length === 0} isError={isError} isLoading={isLoading}>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.ext_id} className="rounded-lg border border-border p-3 flex items-center gap-3">
            <span className="ks-kpi-mini-square brand" style={{ alignItems: "center", borderRadius: 6, display: "flex", height: 30, justifyContent: "center", width: 30 }}>
              <FileText size={14} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-semibold text-sm">{doc.document_type} · {doc.reference_type}</div>
              <div className="text-xs text-muted-foreground">
                {t("page.finance.bast.recipient", { date: doc.handover_date ?? "—", name: doc.recipient_name, role: doc.recipient_role })}
              </div>
            </div>
            <span className={`ks-badge ${doc.status === "signed" ? "success" : doc.status === "pending-signature" ? "warn" : "outline"}`}>
              {doc.status}
            </span>
            {doc.file_url && (
              <button className="ks-btn ks-btn-sm" type="button" onClick={() => safeOpenUrl(doc.file_url)}>
                <Download size={12} />
                {t("page.finance.bast.download")}
              </button>
            )}
          </div>
        ))}
      </div>
    </FaQueryState>
  );
}

function InsuranceTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp, isError, isLoading } = useGetInsurancePoliciesQuery({ organizationId });
  const policies = resp?.data?.policies ?? [];

  return (
    <FaQueryState isEmpty={policies.length === 0} isError={isError} isLoading={isLoading}>
      <div className="grid grid-cols-2 gap-3">
        {policies.map((policy) => (
          <div key={policy.ext_id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground" size={14} />
                <span className="font-semibold text-sm">{policy.insurer_name}</span>
              </div>
              <span className={`ks-badge ${policy.status === "active" ? "success" : policy.status === "expiring-soon" ? "warn" : policy.status === "expired" ? "danger" : "info"}`}>
                {policy.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.policy")}</div>
                <div className="font-mono">{policy.policy_number}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.type")}</div>
                <div>{policy.policy_type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.coverage")}</div>
                <div className="font-mono">{formatIDRShort(policy.coverage_amount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.premium")}</div>
                <div className="font-mono">{formatIDR(policy.premium)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.expiry")}</div>
                <div className="flex items-center gap-1">
                  <Calendar size={11} />
                  {policy.expiry_date ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t("page.finance.insurance.assets")}</div>
                <div>{policy.asset_count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FaQueryState>
  );
}

export function FaFinancePage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [tab, setTab] = useState<Tab>("depreciation");

  const { data: dashResp } = useGetFADashboardQuery({ organizationId });
  const { data: draftResp } = useGetJournalEntriesQuery({
    limit: 1,
    organizationId,
    status: "draft",
  });
  const summary = dashResp?.data;
  const pendingPostings = draftResp?.data?.total;

  return (
    <div>
      <FaShellHead
        desc={t("page.finance.desc")}
        title={t("page.finance.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.finance.kpi.totalAcquisition")} tone="brand" value={summary ? formatIDRShort(summary.total_acquisition) : "—"} />
        <FaStat label={t("page.finance.kpi.nbv")} tone="success" value={summary ? formatIDRShort(summary.net_book_value) : "—"} />
        <FaStat label={t("page.finance.kpi.pendingPostings")} sub={t("page.finance.kpi.pendingPostingsSub")} tone={pendingPostings && pendingPostings > 0 ? "warn" : "success"} value={String(pendingPostings ?? 0)} />
        <FaStat label={t("page.finance.kpi.glStatus")} tone="info" value="—" />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((tb) => (
          <button key={tb.id} className={tab === tb.id ? "on" : ""} type="button" onClick={() => setTab(tb.id)}>
            {t(tb.label)}
          </button>
        ))}
      </div>

      <div className="ks-card">
        {tab === "depreciation" && <DepreciationTab organizationId={organizationId} />}
        {tab === "journal" && <JournalTab organizationId={organizationId} />}
        {tab === "bast" && <BastTab organizationId={organizationId} />}
        {tab === "insurance" && <InsuranceTab organizationId={organizationId} />}
      </div>
    </div>
  );
}
