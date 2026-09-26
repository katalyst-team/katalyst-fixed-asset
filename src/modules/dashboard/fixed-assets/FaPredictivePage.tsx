"use client";

import { Activity, AlertTriangle, Brain, Eye, Zap } from "lucide-react";
import { useTranslation } from "next-i18next";
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
  { id: "all", label: "page.predictive.tabs.all" },
  { id: "critical", label: "page.predictive.tabs.critical" },
  { id: "warning", label: "page.predictive.tabs.warning" },
  { id: "watch", label: "page.predictive.tabs.watch" },
  { id: "healthy", label: "page.predictive.tabs.healthy" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "page.predictive.status.active",
  disabled: "page.predictive.status.disabled",
  training: "page.predictive.status.training",
};

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
  const { t } = useTranslation("fixed-assets");
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
        desc={t("page.predictive.desc")}
        title={t("page.predictive.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.predictive.kpi.monitored")} tone="brand" value={String(summary?.totalAssetsMonitored ?? 0)} />
        <FaStat label={t("page.predictive.tabs.critical")} sub={t("page.predictive.kpi.criticalSub")} tone="danger" value={String(summary?.criticalPredictions ?? 0)} />
        <FaStat label={t("page.predictive.kpi.avgAccuracy")} tone={summary && summary.avgAccuracy >= 85 ? "success" : "warn"} value={`${summary?.avgAccuracy ?? 0}%`} />
        <FaStat label={t("page.predictive.kpi.modelsActive")} tone="info" value={`${summary?.modelsActive ?? 0}`} />
      </FaKpiStrip>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div>
          <div className="ks-seg" style={{ marginBottom: 12 }}>
            {TABS.map((tb) => (
              <button key={tb.id} className={tab === tb.id ? "on" : ""} type="button" onClick={() => setTab(tb.id)}>
                {t(tb.label)}
              </button>
            ))}
          </div>

          <FaQueryState isEmpty={predictions.length === 0} isError={isError} isLoading={isLoading}>
            <div className="space-y-2">
              {predictions.map((pred) => {
                const SevIcon = SEV_ICON[pred.severity] ?? Eye;
                const tone = SEV_TONE[pred.severity] ?? "outline";
                return (
                  <div key={pred.ext_id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`ks-kpi-mini-square ${tone}`} style={{ alignItems: "center", borderRadius: 6, display: "flex", height: 30, justifyContent: "center", width: 30 }}>
                        <SevIcon size={14} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold text-sm">{pred.asset_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{pred.asset_code}</div>
                      </div>
                      <span className={`ks-badge ${tone}`}>{pred.severity}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">{t("page.predictive.health")}</div>
                        <div className="font-mono font-semibold text-sm">{pred.current_health}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("page.predictive.daysToFailure")}</div>
                        <div className="font-mono font-semibold text-sm">{pred.days_to_failure}d</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("page.predictive.confidence")}</div>
                        <div className="font-mono font-semibold text-sm">{pred.confidence}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t("page.predictive.estCost")}</div>
                        <div className="font-mono font-semibold text-sm">{formatIDRShort(pred.estimated_cost)}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{t("page.predictive.failure", { value: pred.failure_mode ?? "—" })}</span>
                        <span className="text-muted-foreground">{t("page.predictive.part", { value: pred.failed_part ?? "—" })}</span>
                      </div>
                      <FaMeter pct={pred.current_health} tone={pred.current_health >= 70 ? "success" : pred.current_health >= 40 ? "warn" : "danger"} />
                    </div>

                    <div className="rounded border border-border-soft p-2" style={{ background: "hsl(var(--surface-2))" }}>
                      <div className="text-xs font-semibold mb-1 flex items-center gap-1">
                        <Zap size={11} />
                        {t("page.predictive.recommendedAction")}
                      </div>
                      <div className="text-xs text-muted-foreground">{pred.recommended_action ?? "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t("page.predictive.by", { value: pred.recommended_action_date ?? "—" })}</div>
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
                  {t("page.predictive.modelsTitle")}
                </div>
                <div className="ks-card-desc">{t("page.predictive.modelsCount", { count: models.length })}</div>
              </div>
            </div>
            <div className="ks-card-body">
              <div className="space-y-3">
                {models.map((model) => {
                  const status = model.pending_retrain
                    ? "training"
                    : model.is_active
                      ? "active"
                      : "disabled";
                  return (
                    <div key={model.ext_id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.model_type} · v{model.version}</div>
                        </div>
                        <span className={`ks-badge ${status === "active" ? "success" : status === "training" ? "warn" : "outline"}`}>
                          {t(STATUS_LABEL[status])}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <div className="text-xs text-muted-foreground">{t("page.predictive.accuracy")}</div>
                          <div className="font-mono font-semibold">{model.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("page.predictive.predictions")}</div>
                          <div className="font-mono font-semibold">{model.total_predictions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("page.predictive.assets")}</div>
                          <div className="font-mono font-semibold">{model.asset_count}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("page.predictive.trainedScope", { scope: model.asset_scope, trained: model.last_trained_at ?? "—" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
