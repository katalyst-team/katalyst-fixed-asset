"use client";

import { Calendar, Plus } from "lucide-react";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import { useGetMaintenanceQuery } from "@/hooks/api/fixed-assets";
import { FaKpiStrip, FaShellHead, FaStat } from "@/modules/dashboard/fixed-assets";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";

import { FlowTab, HealthTab } from "./FaMaintenanceTabs";
import { ScheduleTab, WoTab } from "./FaMaintenanceTabsMore";

type Tab = "flow" | "health" | "wo" | "schedule";

const TABS: { id: Tab; label: string }[] = [
  { id: "flow", label: "Flow & Alerts" },
  { id: "health", label: "Asset Health" },
  { id: "wo", label: "Work Orders" },
  { id: "schedule", label: "Inspections & PM" },
];

export function FaMaintenancePage() {
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
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button">
              <Calendar size={14} />
              Schedule
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => openModal("workOrder")}
            >
              <Plus size={14} />
              Create Work Order
            </button>
          </>
        }
        title="Maintenance · CMMS"
      />

      <FaKpiStrip>
        <FaStat label="Open WOs" tone="brand" value={String(openWOs)} />
        <FaStat label="Overdue / Failed" sub="needs attention" tone="danger" value={String(overdueFailed)} />
        <FaStat label="Dormant > 30d" tone="warn" value={String(dormant)} />
        <FaStat label="Fleet MTBF" sub="mean time between" tone="info" value={maintSummary ? `${Math.round(maintSummary.mtbf_days)} d` : "—"} />
      </FaKpiStrip>

      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "on" : ""}
            type="button"
            onClick={() => setTab(t.id)}
          >
            {t.label}
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
