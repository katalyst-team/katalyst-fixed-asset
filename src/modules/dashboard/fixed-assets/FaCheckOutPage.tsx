"use client";

import { Clock, History, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  avatarColor,
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import {
  CAT_LABEL,
  CHECK_OUTS,
} from "@/services/fixed-assets/mock";

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
  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
              onClick={() => toast.info("Loading check-out history")}
            >
              <History size={15} />
              History
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => toast.info("New check-out form")}
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
        <FaStat label="Active loans" tone="info" value="6" />
        <FaStat label="Overdue" sub="needs action" tone="danger" value="1" />
        <FaStat label="Return rate" sub="last 90 days" tone="success" value="94%" />
        <FaStat label="Avg duration" tone="brand" value="2.4d" />
      </FaKpiStrip>

      <div className="ks-card">
        <div className="ks-card-head">
          <div>
            <div className="ks-card-title">Check-Out Records</div>
            <div className="ks-card-desc">
              {CHECK_OUTS.length} loans · RFID-verified chain of custody
            </div>
          </div>
          <button
            className="ks-btn ks-btn-sm"
            type="button"
            onClick={() => toast.info("Exporting check-out log")}
          >
            <History size={13} />
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
              {CHECK_OUTS.map((c, i) => {
                const Icon = catToLucide[
                  c.assetId.startsWith("TL") ? "tool" : c.assetId.startsWith("IT") ? "it" : "furn"
                ];
                return (
                  <tr key={c.id} className="hover:bg-muted">
                    <td className="p-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        <div>
                          <div className="font-medium">{c.asset}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{c.assetId}</span>
                            <span className={`ks-badge ${catToneClass(c.assetId.startsWith("TL") ? "tool" : c.assetId.startsWith("IT") ? "it" : "furn")}`}>
                              {CAT_LABEL[c.assetId.startsWith("TL") ? "tool" : c.assetId.startsWith("IT") ? "it" : "furn"]}
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
                    <td className="p-3 border-t border-border text-muted-foreground">{c.outDate}</td>
                    <td className="p-3 border-t border-border">
                      <span className={c.status === "overdue" ? "font-medium text-[hsl(var(--destructive))]" : "text-muted-foreground"}>
                        {c.status === "overdue" && <Clock className="mr-1 inline" size={12} />}
                        {c.dueDate}
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
                          onClick={() => toast.success(`${c.assetId} returned · custody closed`)}
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
      </div>
    </div>
  );
}
