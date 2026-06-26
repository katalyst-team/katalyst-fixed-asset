"use client";

import { Activity, AlertTriangle, Brain, Eye, Zap } from "lucide-react";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useGetPredictionResultsQuery,
  useGetPredictiveModelsQuery,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaMeter,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import type { PredictionSeverity } from "@/types/fixed-assets";

type SevTab = "all" | PredictionSeverity;

const TABS: { id: SevTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "watch", label: "Watch" },
  { id: "healthy", label: "Healthy" },
];

const SEV_TONE: Record<string, string> = {
  critical: "danger",
  healthy: "success",
  warning: "warn",
  watch: "outline",
};

const SEV_ICON: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  healthy: Activity,
  warning: AlertTriangle,
  watch: Eye,
};

export function FaPredictivePage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [tab, setTab] = useState<SevTab>("all");
  const sevParam = tab === "all" ? undefined : tab;

  const { data: modelsResp } = useGetPredictiveModelsQuery({ organizationId });
  const { data: resultsResp, isError, isLoading } = useGetPredictionResultsQuery({
    organizationId,
    severity: sevParam,
  });

  const summary = modelsResp?.data?.summary;
  const models = modelsResp?.data?.models ?? [];
  const predictions = resultsResp?.data?.predictions ?? [];

  return (
    <div>
      <FaShellHead
        desc="AI-powered failure prediction and remaining useful life (RUL) estimates"
        title="Predictive Analytics"
      />

      <FaKpiStrip>
        <FaStat label="Assets Monitored" tone="brand" value={String(summary?.totalAssetsMonitored ?? 0)} />
        <FaStat label="Critical" sub="failure imminent" tone="danger" value={String(summary?.criticalPredictions ?? 0)} />
        <FaStat label="Avg Accuracy" tone={summary && summary.avgAccuracy >= 85 ? "success" : "warn"} value={`${summary?.avgAccuracy ?? 0}%`} />
        <FaStat label="Models Active" tone="info" value={`${summary?.modelsActive ?? 0}`} />
      </FaKpiStrip>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div>
          <div className="ks-seg" style={{ marginBottom: 12 }}>
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <FaQueryState isEmpty={predictions.length === 0} isError={isError} isLoading={isLoading}>
            <div className="space-y-2">
              {predictions.map((pred) => {
                const SevIcon = SEV_ICON[pred.severity] ?? Eye;
                const tone = SEV_TONE[pred.severity] ?? "outline";
                return (
                  <div key={pred.assetId} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`ks-kpi-mini-square ${tone}`} style={{ alignItems: "center", borderRadius: 6, display: "flex", height: 30, justifyContent: "center", width: 30 }}>
                        <SevIcon size={14} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold text-sm">{pred.assetName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{pred.assetId} · {pred.loc}</div>
                      </div>
                      <span className={`ks-badge ${tone}`}>{pred.severity}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Health</div>
                        <div className="font-mono font-semibold text-sm">{pred.currentHealth}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">RUL</div>
                        <div className="font-mono font-semibold text-sm">{pred.rul}d</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="font-mono font-semibold text-sm">{pred.confidence}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Est. Cost</div>
                        <div className="font-mono font-semibold text-sm">{formatIDRShort(pred.estimatedCost)}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Failure: {pred.failureMode}</span>
                        <span className="text-muted-foreground">Part: {pred.failedPart}</span>
                      </div>
                      <FaMeter pct={pred.currentHealth} tone={pred.currentHealth >= 70 ? "success" : pred.currentHealth >= 40 ? "warn" : "danger"} />
                    </div>

                    <div className="rounded border border-border-soft p-2" style={{ background: "hsl(var(--surface-2))" }}>
                      <div className="text-xs font-semibold mb-1 flex items-center gap-1">
                        <Zap size={11} />
                        Recommended Action
                      </div>
                      <div className="text-xs text-muted-foreground">{pred.recommendedAction}</div>
                      <div className="text-xs text-muted-foreground mt-1">By: {pred.recommendedActionDate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FaQueryState>
        </div>

        <div>
          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title flex items-center gap-2">
                  <Brain size={14} />
                  AI Models
                </div>
                <div className="ks-card-desc">{models.length} models</div>
              </div>
            </div>
            <div className="ks-card-body">
              <div className="space-y-3">
                {models.map((model) => (
                  <div key={model.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.modelType} · v{model.version}</div>
                      </div>
                      <span className={`ks-badge ${model.status === "active" ? "success" : model.status === "training" ? "warn" : "outline"}`}>
                        {model.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                        <div className="font-mono font-semibold">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Predictions</div>
                        <div className="font-mono font-semibold">{model.predictions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Assets</div>
                        <div className="font-mono font-semibold">{model.assetCount}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Trained: {model.lastTrained} · Scope: {model.assetScope}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
