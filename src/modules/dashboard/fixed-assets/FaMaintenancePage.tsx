"use client";

import { Calendar, Plus } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import { useGetMaintenanceQuery } from "@/hooks/api/fixed-assets";
import { FaKpiStrip, FaShellHead, FaStat } from "@/modules/dashboard/fixed-assets";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

import { FlowTab, HealthTab } from "./FaMaintenanceTabs";
import { ScheduleTab, WoTab } from "./FaMaintenanceTabsMore";

type Tab = "flow" | "health" | "wo" | "schedule";

const TABS: { id: Tab; label: string }[] = [
  { id: "flow", label: "page.maintenance.tabs.flow" },
  { id: "health", label: "page.maintenance.tabs.health" },
  { id: "wo", label: "page.maintenance.tabs.wo" },
  { id: "schedule", label: "page.maintenance.tabs.schedule" },
];

export function FaMaintenancePage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: maintResp } = useGetMaintenanceQuery({ organizationId });
  const work_orders = maintResp?.data?.work_orders ?? [];
  const health_data = maintResp?.data?.health_data ?? [];
  const maintSummary = maintResp?.data?.summary;
  const openWOs = maintSummary?.open_wo ?? work_orders.filter((w) => w.status === "open" || w.status === "in-progress").length;
  const overdueFailed = health_data.filter((h) => h.status === "critical" || h.status === "alert").length;
  const dormant = health_data.filter((h) => h.since_maint_days > 30).length;
  const [tab, setTab] = useState<Tab>("flow");
  const { openModal } = useFaModal();
  const { canCreate } = useFaPermission();
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button">
              <Calendar size={14} />
              {t("page.maintenance.schedule")}
            </button>
            {canCreate && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => openModal("workOrder")}
              >
                <Plus size={14} />
                {t("page.maintenance.createWo")}
              </button>
            )}
          </>
        }
        title={t("page.maintenance.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.maintenance.kpi.openWos")} tone="brand" value={String(openWOs)} />
        <FaStat
          label={t("page.maintenance.kpi.overdueFailed")}
          sub={t("page.maintenance.kpi.needsAttention")}
          tone="danger"
          value={String(overdueFailed)}
        />
        <FaStat label={t("page.maintenance.kpi.dormant30d")} tone="warn" value={String(dormant)} />
        <FaStat
          label={t("page.maintenance.kpi.fleetMtbf")}
          sub={t("page.maintenance.kpi.mtbfSub")}
          tone="info"
          value={maintSummary ? `${Math.round(maintSummary.mtbf_days)} d` : "—"}
        />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "on" : ""}
            type="button"
            onClick={() => setTab(item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {tab === "flow" && <FlowTab />}
      {tab === "health" && <HealthTab />}
      {tab === "wo" && <WoTab />}
      {tab === "schedule" && <ScheduleTab />}
    </div>
  );
}
