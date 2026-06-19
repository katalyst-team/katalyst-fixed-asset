import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import {
  useGetAgingStockAlertsQuery,
  useGetCriticalStockAlertsQuery,
  useGetEpcMismatchesQuery,
  useGetPendingAuditsQuery,
} from "@/hooks/api/alert/useAlertsQuery";

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "danger";
  title: string;
  message: string;
  count?: number;
  timestamp?: string;
  source: "critical" | "aging" | "epc" | "audit";
}

const alertConfig = {
  danger: {
    bg: "hsl(var(--danger-soft))",
    border: "hsl(var(--destructive) / 0.2)",
    icon: AlertTriangle,
    text: "hsl(var(--destructive))",
  },
  info: {
    bg: "hsl(var(--info-soft))",
    border: "hsl(var(--info) / 0.2)",
    icon: Info,
    text: "hsl(var(--info))",
  },
  success: {
    bg: "hsl(var(--success-soft))",
    border: "hsl(var(--success) / 0.2)",
    icon: CheckCircle2,
    text: "hsl(var(--success))",
  },
  warning: {
    bg: "hsl(var(--warn-soft))",
    border: "hsl(var(--warn) / 0.2)",
    icon: AlertTriangle,
    text: "hsl(var(--warn))",
  },
};

export function Alerts() {
  const { t } = useTranslation("overview");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const criticalStockQuery = useGetCriticalStockAlertsQuery({ organizationId });
  const agingStockQuery = useGetAgingStockAlertsQuery({ organizationId });
  const epcMismatchesQuery = useGetEpcMismatchesQuery({ organizationId });
  const pendingAuditsQuery = useGetPendingAuditsQuery({ organizationId });

  const isLoading =
    criticalStockQuery.isLoading ||
    agingStockQuery.isLoading ||
    epcMismatchesQuery.isLoading ||
    pendingAuditsQuery.isLoading;

  const alerts: Alert[] = React.useMemo(() => {
    const result: Alert[] = [];

    if (criticalStockQuery.data?.data?.count && criticalStockQuery.data.data.count > 0) {
      result.push({
        count: criticalStockQuery.data.data.count,
        id: "critical-stock",
        message: `${criticalStockQuery.data.data.count} SKUs below safety stock`,
        source: "critical",
        timestamp: criticalStockQuery.data.data.items[0]?.sku_name,
        title: "Critical Stock Alert",
        type: "danger",
      });
    }

    if (agingStockQuery.data?.data?.count && agingStockQuery.data.data.count > 0) {
      result.push({
        count: agingStockQuery.data.data.count,
        id: "aging-stock",
        message: `${agingStockQuery.data.data.count} SKUs with slow movement (> 90 days)`,
        source: "aging",
        title: "Aging Stock Alert",
        type: "warning",
      });
    }

    if (epcMismatchesQuery.data?.data?.count && epcMismatchesQuery.data.data.count > 0) {
      result.push({
        count: epcMismatchesQuery.data.data.count,
        id: "epc-mismatches",
        message: `${epcMismatchesQuery.data.data.count} EPC discrepancies detected`,
        source: "epc",
        timestamp: epcMismatchesQuery.data.data.date,
        title: "EPC Mismatch Alert",
        type: "warning",
      });
    }

    if (pendingAuditsQuery.data?.data?.count && pendingAuditsQuery.data.data.count > 0) {
      result.push({
        count: pendingAuditsQuery.data.data.count,
        id: "pending-audits",
        message: `${pendingAuditsQuery.data.data.count} stock audits pending completion`,
        source: "audit",
        timestamp: pendingAuditsQuery.data.data.audits[0]?.scheduled_date,
        title: "Pending Audits",
        type: "info",
      });
    }

    return result;
  }, [
    criticalStockQuery.data,
    agingStockQuery.data,
    epcMismatchesQuery.data,
    pendingAuditsQuery.data,
  ]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">{t("alerts.title", "Alerts")}</div>
        {visibleAlerts.length > 0 && !isLoading && (
          <span className="ks-badge danger">{visibleAlerts.length}</span>
        )}
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-2)" }}>
                <Skeleton className="h-5 w-5 rounded-md" />
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleAlerts.length === 0 ? (
          <div
            style={{
              color: "hsl(var(--text-3))",
              fontSize: "13px",
              padding: "30px 0",
              textAlign: "center",
            }}
          >
            {t("alerts.empty", "No alerts at this time")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {visibleAlerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  style={{
                    alignItems: "flex-start",
                    background: config.bg,
                    border: `1px solid ${config.border}`,
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    gap: "var(--space-2)",
                    padding: "var(--space-3)",
                    position: "relative",
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: config.text,
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        alignItems: "center",
                        color: config.text,
                        display: "flex",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        gap: 6,
                      }}
                    >
                      {alert.title}
                      {alert.count !== undefined && alert.count > 1 && (
                        <span
                          style={{
                            background: "rgba(255, 255, 255, 0.6)",
                            borderRadius: "999px",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                          }}
                        >
                          {alert.count}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        color: config.text,
                        fontSize: "0.75rem",
                        marginTop: "2px",
                        opacity: 0.8,
                      }}
                    >
                      {alert.message}
                    </div>
                    {alert.timestamp && (
                      <div
                        style={{
                          color: config.text,
                          fontSize: "0.7rem",
                          marginTop: "4px",
                          opacity: 0.6,
                        }}
                      >
                        {formatTime(alert.timestamp)}
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    style={{
                      color: config.text,
                      height: 20,
                      opacity: 0.7,
                      padding: 4,
                      position: "absolute",
                      right: 8,
                      top: 8,
                      width: 20,
                    }}
                    variant="ghost"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
