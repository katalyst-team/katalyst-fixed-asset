"use client";

import {
  Ban,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDR,
} from "@/modules/dashboard/fixed-assets";
import {
  CAT_LABEL,
  DISPOSALS,
} from "@/services/fixed-assets/mock";

interface ApprovalStep {
  date: string;
  label: string;
  who: string;
}

const APPROVAL_FLOW: ApprovalStep[] = [
  { date: "14 Oct", label: "Request submitted", who: "Andi P." },
  { date: "15 Oct", label: "Dept Head review", who: "Dewi A." },
  { date: "—", label: "Finance review", who: "Pending" },
  { date: "—", label: "CFO approval", who: "Pending" },
  { date: "—", label: "BAST signed", who: "Pending" },
];

const STAGE_BY_STATUS: Record<string, number> = {
  "Approved": 5,
  "BAST signed": 5,
  "CFO approval": 4,
  "Dept Head": 2,
  "Finance review": 3,
};

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("approv") || s.includes("signed")) return "success";
  if (s.includes("review") || s.includes("head")) return "warn";
  return "info";
}

export function FaScanOutPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const item = DISPOSALS[selectedIdx];
  const Icon = catToLucide[item.cat] ?? catToLucide.furn;
  const stage = STAGE_BY_STATUS[item.status] ?? 2;
  const gain = item.rec - item.nbv;
  const costBasis = item.nbv + 64000000;
  const accumDep = costBasis - item.nbv;

  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
              onClick={() => toast.info("Generating BAST PDF…")}
            >
              <FileText size={15} />
              BAST PDF
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => toast.info("New disposal request form")}
            >
              <Plus size={15} />
              New disposal
            </button>
          </>
        }
        desc="Retire, sell, or donate assets with full approval + journal trail"
        title="Scan-Out · Asset Disposal"
      />

      <FaKpiStrip>
        <FaStat label="This month" sub="disposals" tone="info" value="24" />
        <FaStat label="Awaiting approval" sub="pending" tone="warn" value="8" />
        <FaStat label="Recovery YTD" tone="success" value="Rp 42 jt" />
        <FaStat label="Tax impact" sub="fiscal drag" tone="danger" value="-Rp 18 jt" />
      </FaKpiStrip>

      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Disposal Queue</div>
              <div className="ks-card-desc">{DISPOSALS.length} items in workflow</div>
            </div>
          </div>
          <div className="ks-card-body">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground p-3">Asset</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Reason</th>
                  <th className="text-right font-medium text-muted-foreground p-3">NBV</th>
                  <th className="text-right font-medium text-muted-foreground p-3">Recovery</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {DISPOSALS.map((d, i) => {
                  const DIcon = catToLucide[d.cat] ?? catToLucide.furn;
                  return (
                    <tr
                      key={d.id}
                      className={`cursor-pointer ${i === selectedIdx ? "bg-[hsl(var(--brand)/0.06)]" : "hover:bg-muted"}`}
                      onClick={() => setSelectedIdx(i)}
                    >
                      <td className="p-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <DIcon size={14} />
                          <div>
                            <div className="font-medium">{d.a}</div>
                            <div className="text-xs text-muted-foreground">{d.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border-t border-border text-muted-foreground">{d.reason}</td>
                      <td className="p-3 border-t border-border text-right">{d.nbv > 0 ? formatIDR(d.nbv) : "—"}</td>
                      <td className="p-3 border-t border-border text-right">{d.rec > 0 ? formatIDR(d.rec) : "—"}</td>
                      <td className="p-3 border-t border-border">
                        <span className={`ks-badge ${statusBadgeClass(d.status)}`}>{d.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Disposal Detail</div>
              <div className="ks-card-desc">{item.id} · approval workflow</div>
            </div>
          </div>
          <div className="ks-card-body space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.a}</span>
                  <span className={`ks-badge ${catToneClass(item.cat)}`}>{CAT_LABEL[item.cat]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
            </div>

            <div className="ks-grid-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Net Book Value</p>
                <p className="mt-1 text-lg font-bold">{formatIDR(item.nbv)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Recovery Value</p>
                <p className="mt-1 text-lg font-bold text-[hsl(var(--success))]">
                  {item.rec > 0 ? formatIDR(item.rec) : "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Approval Flow</p>
              <div className="space-y-0">
                {APPROVAL_FLOW.map((s, i) => {
                  const done = i < stage;
                  const currentStep = i === stage;
                  return (
                    <div key={s.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            done
                              ? "bg-[hsl(var(--brand))] text-white"
                              : currentStep
                                ? "border-2 border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]"
                                : "border border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {done ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
                        </div>
                        {i < APPROVAL_FLOW.length - 1 && (
                          <div className={`my-0.5 w-px flex-1 ${done ? "bg-[hsl(var(--brand))]" : "bg-border"}`} style={{ minHeight: 18 }} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className={`text-sm font-medium ${done || currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.who} · {s.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2">
                <DollarSign size={14} />
                <span className="text-xs font-medium text-muted-foreground">Journal Entry Preview</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Dr. Accumulated depreciation</span>
                  <span className="font-semibold">{formatIDR(accumDep)}</span>
                </div>
                {item.rec > 0 && (
                  <div className="flex justify-between">
                    <span>Dr. Cash / Bank</span>
                    <span className="font-semibold">{formatIDR(item.rec)}</span>
                  </div>
                )}
                {gain < 0 && (
                  <div className="flex justify-between text-[hsl(var(--destructive))]">
                    <span>Dr. Loss on disposal</span>
                    <span className="font-semibold">{formatIDR(Math.abs(gain))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-1">
                  <span>Cr. Fixed assets (cost)</span>
                  <span className="font-semibold">{formatIDR(costBasis)}</span>
                </div>
                {gain > 0 && (
                  <div className="flex justify-between text-[hsl(var(--success))]">
                    <span>Cr. Gain on disposal</span>
                    <span className="font-semibold">{formatIDR(gain)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={() => toast.info("Sending back for revision")}
              >
                <RefreshCw size={15} />
                Revise
              </button>
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={() => toast.error("Disposal rejected")}
              >
                <Ban size={15} />
                Reject
              </button>
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => toast.success(`${item.id} approved — advanced to next stage`)}
              >
                <CheckCircle2 size={15} />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
