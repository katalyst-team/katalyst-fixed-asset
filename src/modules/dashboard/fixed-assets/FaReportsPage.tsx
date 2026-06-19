"use client";

import { Clock, Eye, Plus, Zap } from "lucide-react";
import { toast } from "sonner";

import { FaKpiStrip, FaProtoIcon, FaShellHead, FaStat } from "@/modules/dashboard/fixed-assets";
import { REPORT_TEMPLATES } from "@/services/fixed-assets/mock";

function formatBadgeFor(id: string): string[] {
  if (id.includes("EPCIS")) return ["JSON-LD"];
  if (id.includes("ISO")) return ["PDF"];
  return ["PDF", "Excel"];
}

function ReportCard({ tpl }: { tpl: (typeof REPORT_TEMPLATES)[number] }) {
  return (
    <div className="ks-card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="ks-card-body" style={{ display: "flex", flex: 1, flexDirection: "column", gap: 12 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
          <span className={"ks-kpi-mini-square " + (tpl.tone || "brand")} style={{ alignItems: "center", borderRadius: 8, display: "flex", height: 34, justifyContent: "center", width: 34 }}>
            <FaProtoIcon name={tpl.icon} size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{tpl.name}</div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{tpl.id}</div>
          </div>
        </div>
        <p style={{ color: "hsl(var(--text-2))", flex: 1, fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{tpl.desc}</p>
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {formatBadgeFor(tpl.id).map((f) => (
            <span key={f} className="ks-badge outline">{f}</span>
          ))}
          <span style={{ color: "hsl(var(--text-3))", fontSize: 11, marginLeft: "auto" }}>
            <Clock size={11} style={{ display: "inline", marginRight: 3 }} />{tpl.lastRun}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ks-btn ks-btn-sm" style={{ flex: 1 }} type="button" onClick={() => toast(`Previewing ${tpl.name}…`)}><Eye size={13} />Preview</button>
          <button className="ks-btn ks-btn-primary ks-btn-sm" style={{ flex: 1 }} type="button" onClick={() => toast(`Generating ${tpl.name}…`)}><Plus size={13} />Generate</button>
        </div>
      </div>
    </div>
  );
}

export function FaReportsPage() {
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button" onClick={() => toast("Opening report history…")}><Clock size={14} />History</button>
            <button className="ks-btn ks-btn-primary" type="button" onClick={() => toast("Generating all reports…")}><Zap size={14} />Generate all</button>
          </>
        }
        desc="Financial, compliance, and operational reports — PSAK 16 ready."
        title="Reports"
      />
      <FaKpiStrip>
        <FaStat label="Available reports" tone="brand" value="12" />
        <FaStat label="Generated today" tone="success" value="3" />
        <FaStat label="Scheduled monthly" tone="info" value="8" />
        <FaStat label="Compliance status" sub="all green" tone="success" value="OK" />
      </FaKpiStrip>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {REPORT_TEMPLATES.map((tpl) => (
          <ReportCard key={tpl.id} tpl={tpl} />
        ))}
      </div>
    </div>
  );
}
