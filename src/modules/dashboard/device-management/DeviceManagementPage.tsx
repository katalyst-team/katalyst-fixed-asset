"use client";

import { Cpu, RefreshCw } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetGateLogListQuery from "@/hooks/api/gate-log/useGetGateLogListQuery";
import { formatDateTime } from "@/utils/text";

interface DeviceSummary {
  antennaSet: Set<number>;
  lastSeen: string;
  stores: Set<string>;
  totalScans: number;
}

function DeviceManagementContent() {
  const { t } = useTranslation("device-management");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data, isLoading, refetch } = useGetGateLogListQuery({
    filters: { limit: 1000 },
    organizationId,
  });

  const allLogs = React.useMemo(
    () => data?.data?.gate_log ?? [],
    [data?.data?.gate_log],
  );

  const devices = React.useMemo(() => {    const map = new Map<string, DeviceSummary>();
    for (const log of allLogs) {
      const did = log.device_id ?? "unknown";
      const existing = map.get(did) ?? {
        antennaSet: new Set<number>(),
        lastSeen: log.ts,
        stores: new Set<string>(),
        totalScans: 0,
      };
      existing.totalScans++;
      if (new Date(log.ts) > new Date(existing.lastSeen)) {
        existing.lastSeen = log.ts;
      }
      existing.stores.add(log.store.name);
      existing.antennaSet.add(log.ant);
      map.set(did, existing);
    }
    return Array.from(map.entries())
      .map(([deviceId, summary]) => ({
        antennas: Array.from(summary.antennaSet).sort((a, b) => a - b),
        deviceId,
        lastSeen: summary.lastSeen,
        stores: Array.from(summary.stores),
        totalScans: summary.totalScans,
      }))
      .sort((a, b) => b.totalScans - a.totalScans);
  }, [allLogs]);

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("title")}</h1>
          <p className="ks-page-desc">{t("description")}</p>
        </div>
        <div className="ks-page-actions">
          <button
            className="ks-btn ks-btn-ghost ks-btn-icon"
            title="Refresh"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading className="min-h-[40vh]" />
      ) : devices.length === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <Card className="ks-card">
          <div className="ks-card-body" style={{ padding: 0 }}>
            <Table className="border shadow-md rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.header.no")}</TableHead>
                  <TableHead>{t("table.header.deviceId")}</TableHead>
                  <TableHead>{t("table.header.totalScans")}</TableHead>
                  <TableHead>{t("table.header.lastSeen")}</TableHead>
                  <TableHead>{t("table.header.stores")}</TableHead>
                  <TableHead>{t("table.header.antennas")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device, i) => (
                  <TableRow key={device.deviceId}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                        <Cpu size={14} style={{ color: "hsl(var(--text-3))" }} />
                        <span className="font-medium" style={{ fontFamily: "monospace" }}>
                          {device.deviceId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{device.totalScans.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div style={{ color: "hsl(var(--text-2))", fontSize: 13 }}>
                        {formatDateTime(device.lastSeen)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {device.stores.map((s) => (
                          <span
                            key={s}
                            style={{
                              background: "hsl(var(--surface-2))",
                              borderRadius: 4,
                              fontSize: 12,
                              padding: "2px 8px",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: 4 }}>
                        {device.antennas.map((a) => (
                          <span
                            key={a}
                            style={{
                              background: "hsl(var(--brand-soft))",
                              borderRadius: 4,
                              color: "hsl(var(--brand))",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                            }}
                          >
                            ANT {a}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

const DeviceManagementPage = () => {
  return <DeviceManagementContent />;
};

export default DeviceManagementPage;
