"use client";

import {
  Activity,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <div style={{ color: "hsl(var(--text-2))", fontSize: 12, fontWeight: 500 }}>{label}</div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div style={{ color: "hsl(var(--text))", fontSize: 24, fontWeight: 700 }}>{value}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function GateActivityContent() {
  const { t } = useTranslation("gate-activity");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [selectedGate, setSelectedGate] = React.useState<string>("all");

  const gateListQuery = useGetGateListQuery({ organizationId });
  const gateLogQuery = useGetGateLogListQuery({
    filters: { limit: 1000 },
    organizationId,
  });

  const gates = gateListQuery.data?.data?.gate ?? [];
  const allLogs = React.useMemo(
    () => gateLogQuery.data?.data?.gate_log ?? [],
    [gateLogQuery.data?.data?.gate_log],
  );
  const isLoading = gateListQuery.isLoading || gateLogQuery.isLoading;

  const logs = React.useMemo(
    () =>
      selectedGate === "all"
        ? allLogs
        : allLogs.filter((l) => l.gate.id === selectedGate),
    [allLogs, selectedGate],
  );

  const violations = React.useMemo(
    () => logs.filter((l) => l.gpio_trigger).length,
    [logs],
  );

  const uniqueTags = React.useMemo(
    () => new Set(logs.filter((l) => l.rfid).map((l) => l.rfid.epc)).size,
    [logs],
  );

  const avgRssi = React.useMemo(() => {
    if (logs.length === 0) return 0;
    return Math.round(logs.reduce((s, l) => s + l.rssi, 0) / logs.length);
  }, [logs]);

  const byGate = React.useMemo(() => {
    const map = new Map<string, { name: string; scans: number; violations: number }>();
    for (const log of logs) {
      if (!log.gate) continue;
      const existing = map.get(log.gate.id) ?? { name: log.gate.name, scans: 0, violations: 0 };
      existing.scans++;
      if (log.gpio_trigger) existing.violations++;
      map.set(log.gate.id, existing);
    }
    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.scans - a.scans);
  }, [logs]);

  const topEpcs = React.useMemo(() => {
    const map = new Map<string, { count: number; lastSeen: string }>();
    for (const log of logs) {
      if (!log.rfid) continue;
      const existing = map.get(log.rfid.epc) ?? { count: 0, lastSeen: log.ts };
      existing.count++;
      if (new Date(log.ts) > new Date(existing.lastSeen)) {
        existing.lastSeen = log.ts;
      }
      map.set(log.rfid.epc, existing);
    }
    return Array.from(map.entries())
      .map(([epc, data]) => ({ epc, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [logs]);

  const handleRefresh = () => {
    gateListQuery.refetch();
    gateLogQuery.refetch();
  };

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("title")}</h1>
          <p className="ks-page-desc">{t("description")}</p>
        </div>
        <div className="ks-page-actions">
          <Select value={selectedGate} onValueChange={setSelectedGate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allGates")}</SelectItem>
              {gates.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            className="ks-btn ks-btn-ghost ks-btn-icon"
            title="Refresh"
            type="button"
            onClick={handleRefresh}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="ks-kpi-strip" style={{ marginBottom: 16 }}>
        <MetricCard icon={Activity} label={t("summary.totalScans")} loading={isLoading} value={logs.length} />
        <MetricCard icon={ShieldAlert} label={t("summary.violations")} loading={isLoading} value={violations} />
        <MetricCard icon={Tag} label={t("summary.uniqueTags")} loading={isLoading} value={uniqueTags} />
        <MetricCard icon={BarChart3} label={t("summary.avgRssi")} loading={isLoading} value={avgRssi} />
      </div>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <Card className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">{t("byGate.title")}</div>
          </div>
          <div className="ks-card-body">
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : byGate.length === 0 ? (
              <div style={{ color: "hsl(var(--text-3))", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
                {t("noData")}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {byGate.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      alignItems: "center",
                      background: "hsl(var(--surface-2))",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                    }}
                  >
                    <span style={{ color: "hsl(var(--text))", fontWeight: 600 }}>{g.name}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ color: "hsl(var(--text-2))", fontSize: 13 }}>
                        {g.scans} {t("byGate.scans")}
                      </span>
                      {g.violations > 0 && (
                        <span style={{ color: "hsl(var(--danger))", fontSize: 13, fontWeight: 600 }}>
                          {g.violations} {t("byGate.violations")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">{t("topEpcs.title")}</div>
          </div>
          <div className="ks-card-body">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : topEpcs.length === 0 ? (
              <div style={{ color: "hsl(var(--text-3))", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
                {t("noData")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("topEpcs.epc")}</TableHead>
                    <TableHead>{t("topEpcs.count")}</TableHead>
                    <TableHead>{t("topEpcs.lastSeen")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topEpcs.map((item) => (
                    <TableRow key={item.epc}>
                      <TableCell>
                        <span style={{ fontFamily: "monospace", fontSize: 13 }}>{item.epc}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{item.count}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: "hsl(var(--text-2))", fontSize: 13 }}>
                          {formatDateTime(item.lastSeen)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

const GateActivityPage = () => {
  return <GateActivityContent />;
};

export default GateActivityPage;
