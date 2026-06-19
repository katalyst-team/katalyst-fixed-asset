"use client";

import { Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FaShellHead, FaStat } from "@/modules/dashboard/fixed-assets";

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
  const [tab, setTab] = useState<Tab>("flow");
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
              onClick={() => toast.info("New work order form")}
            >
              <Plus size={14} />
              Create Work Order
            </button>
          </>
        }
        title="Maintenance · CMMS"
      />

      <div className="ks-kpi-strip" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <FaStat label="Open WOs" tone="brand" value="42" />
        <FaStat label="Overdue / Failed" sub="needs attention" tone="danger" value="8" />
        <FaStat label="Dormant > 30d" tone="warn" value="14" />
        <FaStat label="Fleet MTBF" sub="mean time between" tone="info" value="428h" />
      </div>

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
