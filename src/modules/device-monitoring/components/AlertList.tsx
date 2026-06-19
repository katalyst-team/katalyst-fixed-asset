"use client";

import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import type { AlertSeverity, DeviceAlert } from "@/types/device-monitoring";
import { formatDateTime } from "@/utils/text";

interface AlertListProps {
  alerts: DeviceAlert[];
  isLoading: boolean;
  onResolveAlert?: (alert: DeviceAlert) => void;
}

const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case "INFO":
      return "bg-blue-500";
    case "WARNING":
      return "bg-yellow-500";
    case "ERROR":
      return "bg-orange-500";
    case "CRITICAL":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const AlertList = ({ alerts, isLoading, onResolveAlert }: AlertListProps) => {
  const { t } = useTranslation("device-monitoring");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-4xl">✓</div>
        <p className="mt-2 text-sm text-gray-500">{t("alerts.noAlerts")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm ${alert.is_resolved ? "opacity-60" : ""}`}
        >
          <Badge className={getSeverityColor(alert.alert_severity)}>
            {alert.alert_severity}
          </Badge>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{alert.alert_type}</div>
            <div className="mt-1 text-sm text-gray-500">{alert.message}</div>
            <div className="mt-2 text-xs text-gray-400">
              {formatDateTime(alert.created_at)}
              {alert.resolved_at && ` • Resolved: ${formatDateTime(alert.resolved_at)}`}
            </div>
          </div>
          {!alert.is_resolved && onResolveAlert && (
            <button
              className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-500 hover:bg-blue-50"
              onClick={() => onResolveAlert(alert)}
            >
              {t("alerts.resolve")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};