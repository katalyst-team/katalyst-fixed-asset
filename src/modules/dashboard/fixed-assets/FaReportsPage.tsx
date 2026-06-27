"use client";

import { Clock, Eye, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import {
  useGenerateAllReportsMutation,
  useGenerateReportMutation,
  useGetReportHistoryQuery,
  useGetReportPreviewQuery,
  useGetReportTemplatesQuery,
} from "@/hooks/api/fixed-assets";
import { FaKpiStrip, FaProtoIcon, FaShellHead, FaStat } from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import type { FaReportTemplate } from "@/types/fixed-assets";

function formatBadgeFor(id: string): string[] {
  if (id.includes("EPCIS")) return ["JSON-LD"];
  if (id.includes("ISO")) return ["PDF"];
  return ["PDF", "Excel"];
}

function ReportCard({
  onGenerate,
  onPreview,
  tpl,
}: {
  onGenerate: (tpl: FaReportTemplate) => void;
  onPreview: (tpl: FaReportTemplate) => void;
  tpl: FaReportTemplate;
}) {
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
            <Clock size={11} style={{ display: "inline", marginRight: 3 }} />{tpl.last_run}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ks-btn ks-btn-sm" style={{ flex: 1 }} type="button" onClick={() => onPreview(tpl)}><Eye size={13} />Preview</button>
          <button className="ks-btn ks-btn-primary ks-btn-sm" style={{ flex: 1 }} type="button" onClick={() => onGenerate(tpl)}><Plus size={13} />Generate</button>
        </div>
      </div>
    </div>
  );
}

export function FaReportsPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetReportTemplatesQuery({ organizationId });
  const { mutate: generateReport } = useGenerateReportMutation({
    organizationId,
  });
  const { mutate: generateAll } = useGenerateAllReportsMutation({
    organizationId,
  });
  const { data: historyResp } = useGetReportHistoryQuery({ organizationId });
  const [previewId, setPreviewId] = useState<string>("");
  const { data: previewResp } = useGetReportPreviewQuery({
    enabled: Boolean(previewId),
    organizationId,
    reportId: previewId,
  });
  const templates = resp?.data?.templates ?? [];
  const history = historyResp?.data?.reports ?? [];

  const handlePreview = (tpl: FaReportTemplate) => {
    setPreviewId(tpl.id);
    if (previewResp?.data?.html) {
      const iframe = document.createElement("iframe");
      iframe.style.border = "none";
      iframe.style.height = "100vh";
      iframe.style.width = "100vw";
      iframe.setAttribute("sandbox", "allow-same-origin");
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.document.body.style.margin = "0";
        w.document.body.appendChild(iframe);
        iframe.srcdoc = previewResp.data.html;
      }
    } else {
      toast.info("Preparing preview…");
    }
  };

  const handleHistory = () => {
    if (history.length === 0) {
      toast.info("No report history yet");
      return;
    }
    const latest = history[0];
    if (latest.download_url) {
      safeOpenUrl(latest.download_url);
    }
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button" onClick={handleHistory}><Clock size={14} />History</button>
            <button className="ks-btn ks-btn-primary" type="button" onClick={() => generateAll({ format: "pdf" })}><Zap size={14} />Generate all</button>
          </>
        }
        desc="Financial, compliance, and operational reports — PSAK 16 ready."
        title="Reports"
      />
      <FaKpiStrip>
        <FaStat label="Available reports" tone="brand" value={String(templates.length)} />
        <FaStat label="Generated today" tone="success" value={String(history.length)} />
        <FaStat label="Scheduled monthly" tone="info" value="—" />
        <FaStat label="Compliance status" sub="all green" tone="success" value="—" />
      </FaKpiStrip>
      <FaQueryState
        isEmpty={templates.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {templates.map((tpl) => (
          <ReportCard
            key={tpl.id}
            tpl={tpl}
            onGenerate={(t) =>
              generateReport({
                format: "pdf",
                template_id: t.id,
              })
            }
            onPreview={handlePreview}
          />
        ))}
      </div>
      </FaQueryState>
    </div>
  );
}
