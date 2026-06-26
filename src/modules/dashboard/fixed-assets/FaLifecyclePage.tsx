"use client";

import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import { useGetAssetLifecycleQuery } from "@/hooks/api/fixed-assets";
import {
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatAge,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import type { FaLifecycleAsset, LifecycleStage } from "@/types/fixed-assets";

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

function LifecycleRow({ asset }: { asset: FaLifecycleAsset }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = catToLucide[asset.cat] ?? Package;
  const tone = catToneClass(asset.cat);

  return (
    <div className="rounded-lg border border-border">
      <button className="w-full text-left p-3" style={{ background: "transparent" }} type="button" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <span className={`ks-kpi-mini-square ${tone}`} style={{ alignItems: "center", borderRadius: 6, display: "flex", height: 30, justifyContent: "center", width: 30 }}>
            <Icon size={14} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="font-semibold text-sm">{asset.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{asset.id} · {CAT_LABEL[asset.cat] ?? asset.cat}</div>
          </div>
          <span className="ks-badge info">{STAGE_LABEL[asset.currentStage] ?? asset.currentStage}</span>
          <div style={{ minWidth: 100 }}>
            <div style={{ background: "hsl(var(--surface-2))", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{ background: "hsl(var(--brand))", borderRadius: 4, height: "100%", width: `${asset.lifecycleProgress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">{asset.lifecycleProgress}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono">{formatIDRShort(asset.netBookValue)}</div>
            <div className="text-xs text-muted-foreground">{formatAge(asset.ageDays)}</div>
          </div>
          {expanded ? <ChevronUp className="text-muted-foreground" size={14} /> : <ChevronDown className="text-muted-foreground" size={14} />}
        </div>
      </button>
      {expanded && asset.events.length > 0 && (
        <div className="p-3 pt-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Lifecycle Events ({asset.totalEvents})</div>
          <div className="space-y-1">
            {asset.events.map((event) => (
              <div key={event.eventId} className="flex items-start gap-3 p-2 rounded border border-border-soft">
                <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: "hsl(var(--brand))" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{event.type}</span>
                    <span className="ks-badge outline" style={{ fontSize: 9 }}>{STAGE_LABEL[event.stage] ?? event.stage}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{event.detail}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {event.actor} · {event.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FaLifecyclePage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [stage, setStage] = useState<FilterStage>("all");
  const stageParam = stage === "all" ? undefined : stage;

  const { data: resp, isError, isLoading } = useGetAssetLifecycleQuery({
    organizationId,
    stage: stageParam,
  });

  const summary = resp?.data?.summary;
  const assets = resp?.data?.assets ?? [];

  return (
    <div>
      <FaShellHead
        desc="Complete lifecycle tracking from acquisition through deployment to disposal"
        title="Asset Lifecycle"
      />

      <FaKpiStrip>
        <FaStat label="Total Assets" tone="brand" value={String(summary?.totalAssets ?? 0)} />
        <FaStat label="In Use" tone="success" value={String(summary?.inUse ?? 0)} />
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

      <FaQueryState isEmpty={assets.length === 0} isError={isError} isLoading={isLoading}>
        <div className="space-y-2">
          {assets.map((asset) => (
            <LifecycleRow key={asset.id} asset={asset} />
          ))}
        </div>
      </FaQueryState>
    </div>
  );
}
