"use client";

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
  { id: "all", label: "All" },
  { id: "planning", label: "Planning" },
  { id: "procurement", label: "Procurement" },
  { id: "deployed", label: "Deployed" },
  { id: "in-use", label: "In Use" },
  { id: "maintenance", label: "Maintenance" },
  { id: "disposal", label: "Disposal" },
  { id: "retired", label: "Retired" },
];

const STAGE_LABEL: Record<string, string> = {
  audit: "Audit",
  "checked-out": "Checked Out",
  deployed: "Deployed",
  disposal: "Disposal",
  "in-use": "In Use",
  maintenance: "Maintenance",
  planning: "Planning",
  procurement: "Procurement",
  received: "Received",
  retired: "Retired",
  tagged: "Tagged",
  transfer: "Transfer",
};

export function FaLifecyclePage() {
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
        desc="Complete lifecycle tracking from acquisition through deployment to disposal"
        title="Asset Lifecycle"
      />

      <FaKpiStrip>
        <FaStat label="Total Assets" tone="brand" value={String(summary?.total_assets ?? 0)} />
        <FaStat label="In Use" tone="success" value={String(summary?.in_use ?? 0)} />
        <FaStat label="Acquiring" sub="procurement + received" tone="info" value={String(summary?.acquiring ?? 0)} />
        <FaStat label="Disposed / Retired" tone="warn" value={String(summary?.disposed ?? 0)} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {STAGES.map((s) => (
          <button key={s.id} className={stage === s.id ? "on" : ""} type="button" onClick={() => setStage(s.id)}>
            {s.label}
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
                  <span className="ks-badge info">{STAGE_LABEL[event.stage] ?? event.stage}</span>
                  {event.from_stage && (
                    <span className="ks-badge outline" style={{ fontSize: 9 }}>
                      from {STAGE_LABEL[event.from_stage] ?? event.from_stage}
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
