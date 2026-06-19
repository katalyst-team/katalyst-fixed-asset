"use client";

import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DeviceMonitoring } from "@/types/device-monitoring";

interface DeviceTableProps {
  devices: DeviceMonitoring[];
  isLoading: boolean;
  onDeleteDevice?: (device: DeviceMonitoring) => void;
  onRowClick?: (device: DeviceMonitoring) => void;
}

export const DeviceTable = ({
  devices,
  isLoading,
  onDeleteDevice,
  onRowClick,
}: DeviceTableProps) => {
  const { t, i18n } = useTranslation("device-monitoring");
  const locale = i18n.language === "en" ? undefined : idLocale;

  const formatLastSeen = (dateStr: string) => {
    const date = new Date(dateStr);
    const relative = formatDistanceToNow(date, { addSuffix: true, locale });
    const full = date.toLocaleString(i18n.language === "en" ? "en-US" : "id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return { full, relative };
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">📡</div>
        <h3 className="text-lg font-medium text-foreground">
          {t("empty.title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.no")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.deviceType")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.deviceId")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.deviceName")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.gate")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.status")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.ipAddress")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.lastSeen")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.rssi")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.errorCount")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
              {t("table.header.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {devices.map((device, index) => (
            <tr
              key={device.id}
              className={`cursor-pointer transition-colors hover:bg-muted/30 ${!device.is_active ? "opacity-50" : ""}`}
              onClick={() => onRowClick?.(device)}
            >
              <td className="px-4 py-4 text-sm text-foreground">
                {index + 1}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.device_type === "GATE" ? "Gate" : "Fixed Reader"}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.device_id}
              </td>
              <td className="px-4 py-4 text-sm font-medium text-foreground">
                <div>{device.device_name}</div>
                {!device.is_active && (
                  <Badge className="mt-1 bg-muted text-muted-foreground">
                    {t("table.inactive")}
                  </Badge>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.gate ? (
                  <div>
                    <div>{device.gate.name}</div>
                    {device.gate.section && (
                      <div className="text-xs text-muted-foreground">
                        {device.gate.section.name}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-4">
                {device.status === "ONLINE" ? (
                  <Badge className="bg-green-500">
                    {t("filter.online")}
                  </Badge>
                ) : (
                  <Badge className="bg-red-500">
                    {t("filter.offline")}
                  </Badge>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.ip_address}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.last_seen_at
                  ? (() => {
                      const { full, relative } = formatLastSeen(
                        device.last_seen_at,
                      );
                      return <span title={full}>{relative}</span>;
                    })()
                  : "-"}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.last_rssi !== null
                  ? `${device.last_rssi} dBm`
                  : "-"}
              </td>
              <td className="px-4 py-4 text-sm text-foreground">
                {device.error_count}
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(device);
                    }}
                  >
                    {t("table.detail")}
                  </Button>
                  {onDeleteDevice && (
                    <ButtonDelete
                      onSubmit={async (e) => {
                        e.stopPropagation();
                        onDeleteDevice(device);
                      }}
                    >
                      <Trash2 size={14} />
                    </ButtonDelete>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
