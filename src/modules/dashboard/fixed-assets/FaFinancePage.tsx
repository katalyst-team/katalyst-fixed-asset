"use client";

import { Calendar, Download, FileText, Play, Shield } from "lucide-react";
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

type Tab = "depreciation" | "journal" | "bast" | "insurance";

const TABS: { id: Tab; label: string }[] = [
  { id: "depreciation", label: "Depreciation" },
  { id: "journal", label: "Journal Entries" },
  { id: "bast", label: "BAST Documents" },
  { id: "insurance", label: "Insurance" },
];

function DepreciationTab({ organizationId }: { organizationId: string }) {
  const { data: resp, isError, isLoading } = useGetDepreciationScheduleQuery({ organizationId });
  const schedules = resp?.data?.schedules ?? [];
  const { isPending: isRunning, mutateAsync: runDepreciation } = useRunDepreciationMutation({ organizationId });

  const handleRunDepreciation = async () => {
    await runDepreciation();
  };

  return (
    <FaQueryState isEmpty={schedules.length === 0} isError={isError} isLoading={isLoading}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="text-xs text-muted-foreground">
          {schedules.length} schedules · straight-line PSAK 16
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="ks-btn ks-btn-sm ks-btn-primary"
              disabled={isRunning}
              type="button"
            >
              <Play size={12} />
              {isRunning ? "Posting…" : "Run depreciation"}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Post depreciation for this fiscal year?</AlertDialogTitle>
              <AlertDialogDescription>
                All unposted depreciation schedules for the current year will be posted, asset net book values updated, and a journal entry created. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleRunDepreciation}>Run depreciation</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asset</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Method</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acquisition</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly Depr.</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Net Book Value</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</th>
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
                    {sch.ageYears}y / {sch.usefulLife}y
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
  const { data: resp, isError, isLoading } = useGetJournalEntriesQuery({ organizationId });
  const entries = resp?.data?.entries ?? [];
  const { isPending: isPosting, mutateAsync: postJournalEntry } = usePostJournalEntryMutation({ organizationId });

  const handlePost = async (journalEntryId: string) => {
    await postJournalEntry({ journalEntryId });
  };

  return (
    <FaQueryState isEmpty={entries.length === 0} isError={isError} isLoading={isLoading}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debit</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credit</th>
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
            <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
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
                {entry.status === "pending" && (
                  <button
                    className="ks-btn ks-btn-sm"
                    disabled={isPosting}
                    type="button"
                    onClick={() => handlePost(entry.id)}
                  >
                    Post
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
                Recipient: {doc.recipient_name} ({doc.recipient_role}) · Handover: {doc.handover_date ?? "—"}
              </div>
            </div>
            <span className={`ks-badge ${doc.status === "signed" ? "success" : doc.status === "pending-signature" ? "warn" : "outline"}`}>
              {doc.status}
            </span>
            {doc.file_url && (
              <button className="ks-btn ks-btn-sm" type="button" onClick={() => safeOpenUrl(doc.file_url)}>
                <Download size={12} />
                Download
              </button>
            )}
          </div>
        ))}
      </div>
    </FaQueryState>
  );
}

function InsuranceTab({ organizationId }: { organizationId: string }) {
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
                <div className="text-xs text-muted-foreground">Policy</div>
                <div className="font-mono">{policy.policy_number}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Type</div>
                <div>{policy.policy_type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Coverage</div>
                <div className="font-mono">{formatIDRShort(policy.coverage_amount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Premium</div>
                <div className="font-mono">{formatIDR(policy.premium)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Expiry</div>
                <div className="flex items-center gap-1">
                  <Calendar size={11} />
                  {policy.expiry_date ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Assets</div>
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
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [tab, setTab] = useState<Tab>("depreciation");

  const { data: journalResp } = useGetJournalEntriesQuery({ enabled: tab === "journal", organizationId });
  const summary = journalResp?.data?.summary;

  return (
    <div>
      <FaShellHead
        desc="PSAK 16 compliant depreciation, GL journal entries, BAST documents, and insurance"
        title="Financial Integration"
      />

      <FaKpiStrip>
        <FaStat label="Total Acquisition" tone="brand" value={summary ? formatIDRShort(summary.totalAcquisitionValue) : "—"} />
        <FaStat label="Net Book Value" tone="success" value={summary ? formatIDRShort(summary.netBookValue) : "—"} />
        <FaStat label="Pending Postings" sub="journal entries" tone={summary && summary.pendingPostings > 0 ? "warn" : "success"} value={String(summary?.pendingPostings ?? 0)} />
        <FaStat label="GL Status" tone={summary?.glIntegrationStatus === "connected" ? "success" : "danger"} value={summary?.glIntegrationStatus ?? "—"} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
            {t.label}
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
