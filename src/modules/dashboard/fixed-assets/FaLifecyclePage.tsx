"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useGetAssetLifecycleQuery,
  useGetLifecycleSummaryQuery,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import type { LifecycleStage } from "@/types/fixed-assets";

type FilterStage = "all" | LifecycleStage;

const STAGES: { id: FilterStage; label: string }[] = [
  { id: "all", label: "page.lifecycle.stages.all" },
  { id: "planning", label: "page.lifecycle.stages.planning" },
  { id: "procurement", label: "page.lifecycle.stages.procurement" },
  { id: "deployed", label: "page.lifecycle.stages.deployed" },
  { id: "in-use", label: "page.lifecycle.stages.inUse" },
  { id: "maintenance", label: "page.lifecycle.stages.maintenance" },
  { id: "disposal", label: "page.lifecycle.stages.disposal" },
  { id: "retired", label: "page.lifecycle.stages.retired" },
];

const STAGE_LABEL: Record<string, string> = {
  audit: "page.lifecycle.stage.audit",
  "checked-out": "page.lifecycle.stage.checkedOut",
  deployed: "page.lifecycle.stage.deployed",
  disposal: "page.lifecycle.stage.disposal",
  "in-use": "page.lifecycle.stage.inUse",
  maintenance: "page.lifecycle.stage.maintenance",
  planning: "page.lifecycle.stage.planning",
  procurement: "page.lifecycle.stage.procurement",
  received: "page.lifecycle.stage.received",
  retired: "page.lifecycle.stage.retired",
  tagged: "page.lifecycle.stage.tagged",
  transfer: "page.lifecycle.stage.transfer",
};

export function FaLifecyclePage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [stage, setStage] = useState<FilterStage>("all");
  const stageParam = stage === "all" ? undefined : stage;

  const { data: summaryResp } = useGetLifecycleSummaryQuery({ organizationId });
  const { data: resp, isError, isLoading } = useGetAssetLifecycleQuery({
    organizationId,
    stage: stageParam,
  });

  const summary = summaryResp?.data;
  const events = resp?.data?.events ?? [];

  return (
    <div>
      <FaShellHead
        desc={t("page.lifecycle.desc")}
        title={t("page.lifecycle.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.lifecycle.kpi.totalAssets")} tone="brand" value={String(summary?.total_assets ?? 0)} />
        <FaStat label={t("page.lifecycle.kpi.inUse")} tone="success" value={String(summary?.in_use ?? 0)} />
        <FaStat label={t("page.lifecycle.kpi.acquiring")} sub={t("page.lifecycle.kpi.acquiringSub")} tone="info" value={String(summary?.acquiring ?? 0)} />
        <FaStat label={t("page.lifecycle.kpi.disposedRetired")} tone="warn" value={String(summary?.disposed ?? 0)} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {STAGES.map((s) => (
          <button key={s.id} className={stage === s.id ? "on" : ""} type="button" onClick={() => setStage(s.id)}>
            {t(s.label)}
          </button>
        ))}
      </div>

      <FaQueryState isEmpty={events.length === 0} isError={isError} isLoading={isLoading}>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.ext_id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: "hsl(var(--brand))" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{event.event_type}</span>
                  <span className="ks-badge info">{t(STAGE_LABEL[event.stage] ?? event.stage)}</span>
                  {event.from_stage && (
                    <span className="ks-badge outline" style={{ fontSize: 9 }}>
                      {t("page.lifecycle.from", { stage: STAGE_LABEL[event.from_stage] ?? event.from_stage })}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {event.asset_code} · {event.asset_name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{event.detail}</div>
                {event.notes && <div className="text-xs text-muted-foreground mt-0.5">{event.notes}</div>}
                <div className="text-xs text-muted-foreground mt-0.5">
                  {event.actor_name} · {event.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </FaQueryState>
    </div>
  );
}
