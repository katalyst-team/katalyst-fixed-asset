"use client";

import {
  Activity,
  BarChart3,
  Radio,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useGetGateListQuery from "@/hooks/api/gate/useGetGateListQuery";
import useGetGateLogListQuery from "@/hooks/api/gate-log/useGetGateLogListQuery";
import { formatDateTime } from "@/utils/text";

function MetricCard({
  icon: Icon,
  label,
  loading,
  value,
}: {
  icon: React.ElementType;
  label: string;
  loading: boolean;
  value: string | number;
}) {
  return (
    <div className="ks-card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ alignItems: "center", display: "flex", gap: 12, padding: "16px 20px" }}>
        <div
          style={{
            alignItems: "center",
            background: "hsl(var(--brand-soft))",
            borderRadius: 10,
            color: "hsl(var(--brand))",
            display: "flex",
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          <Icon size={20} />
        </div>
        <div>
          <div style={{ color: "hsl(var(--text-2))", fontSize: 12, fontWeight: 500 }}>
            {label}
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div style={{ color: "hsl(var(--text))", fontSize: 24, fontWeight: 700 }}>
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GateStatusCard({
  gate,
  lastLog,
  loading,
}: {
  gate: { id: string; name: string; store?: { name: string } };
  lastLog?: { ts: string } | null;
  loading: boolean;
}) {
  const { t } = useTranslation("gate-monitor");
  const hasRecent = lastLog
    ? Date.now() - new Date(lastLog.ts).getTime() < 24 * 60 * 60 * 1000
    : false;
  const StatusIcon = hasRecent ? Wifi : WifiOff;
  const statusColor = hasRecent ? "hsl(142 71% 45%)" : "hsl(var(--text-3))";
  const statusLabel = hasRecent ? "Online" : "Offline";

  return (
    <Card className="ks-card">
      <div className="ks-card-body" style={{ padding: "16px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", gap: 12 }}>
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div style={{ flex: 1 }}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
            <div
              style={{
                alignItems: "center",
                background: hasRecent ? "hsl(142 71% 45% / 10%)" : "hsl(var(--surface-2))",
                borderRadius: 10,
                color: statusColor,
                display: "flex",
                height: 40,
                justifyContent: "center",
                width: 40,
              }}
            >
              <StatusIcon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                <span style={{ color: "hsl(var(--text))", fontSize: 14, fontWeight: 600 }}>
                  {gate.name}
                </span>
                <span
                  style={{
                    background: hasRecent ? "hsl(142 71% 45% / 15%)" : "hsl(var(--surface-2))",
                    borderRadius: 999,
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              <div style={{ color: "hsl(var(--text-2))", fontSize: 12 }}>
                {gate.store?.name ?? "—"}
              </div>
              {lastLog && (
                <div style={{ color: "hsl(var(--text-3))", fontSize: 11, marginTop: 2 }}>
                  {t("gates.lastSeen")}: {formatDateTime(lastLog.ts)}
                </div>
              )}
              {!lastLog && (
                <div style={{ color: "hsl(var(--text-3))", fontSize: 11, marginTop: 2 }}>
                  {t("gates.noLogs")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function GateMonitorContent() {
  const { t } = useTranslation("gate-monitor");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const gateListQuery = useGetGateListQuery({ organizationId });
  const gateLogQuery = useGetGateLogListQuery({
    filters: { limit: 100 },
    organizationId,
  });

  const gates = gateListQuery.data?.data?.gate ?? [];
  const allLogs = React.useMemo(
    () => gateLogQuery.data?.data?.gate_log ?? [],
    [gateLogQuery.data?.data?.gate_log],
  );
  const isLoading = gateListQuery.isLoading || gateLogQuery.isLoading;

  const violations = React.useMemo(
    () => allLogs.filter((l) => l.gpio_trigger).length,
    [allLogs],
  );

  const avgRssi = React.useMemo(() => {
    if (allLogs.length === 0) return 0;
    return Math.round(allLogs.reduce((s, l) => s + l.rssi, 0) / allLogs.length);
  }, [allLogs]);

  const lastLogByGate = React.useMemo(() => {
    const map = new Map<string, { ts: string }>();
    for (const log of allLogs) {
      if (!log.gate) continue;
      const existing = map.get(log.gate.id);
      if (!existing || new Date(log.ts) > new Date(existing.ts)) {
        map.set(log.gate.id, { ts: log.ts });
      }
    }
    return map;
  }, [allLogs]);

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("title")}</h1>
          <p className="ks-page-desc">{t("description")}</p>
        </div>
      </div>

      <div className="ks-kpi-strip" style={{ marginBottom: 16 }}>
        <MetricCard icon={Radio} label={t("summary.totalGates")} loading={isLoading} value={gates.length} />
        <MetricCard icon={Activity} label={t("summary.totalLogs24h")} loading={isLoading} value={allLogs.length} />
        <MetricCard icon={ShieldAlert} label={t("summary.violations")} loading={isLoading} value={violations} />
        <MetricCard icon={BarChart3} label={t("summary.avgRssi")} loading={isLoading} value={avgRssi} />
      </div>

      <div className="ks-card" style={{ marginBottom: 16 }}>
        <div className="ks-card-head">
          <div className="ks-card-title">{t("gates.title")}</div>
        </div>
        <div className="ks-card-body">
          {isLoading ? (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : gates.length === 0 ? (
            <div style={{ color: "hsl(var(--text-3))", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
              {t("noData")}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {gates.map((gate) => (
                <GateStatusCard
                  key={gate.id}
                  gate={gate}
                  lastLog={lastLogByGate.get(gate.id)}
                  loading={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const GateMonitorPage = () => {
  return <GateMonitorContent />;
};

export default GateMonitorPage;
