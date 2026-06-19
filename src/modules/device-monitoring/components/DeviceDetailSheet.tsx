"use client";

import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import { useGetDeviceMetricListQuery } from "@/hooks/api/device-monitoring";
import type {
  DeviceMonitoring,
  UpdateDeviceMonitoringPayload,
} from "@/types/device-monitoring";
import { formatDateTime } from "@/utils/text";

import { MetricsChart } from "./MetricsChart";

interface DeviceDetailSheetProps {
  device: DeviceMonitoring | null;
  isOpen: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onUpdate: (
    deviceId: string,
    payload: UpdateDeviceMonitoringPayload,
  ) => void;
}

const getSignalStrength = (
  rssi: number | null,
  t: (key: string) => string,
) => {
  if (rssi === null) return { color: "text-muted-foreground", text: "-" };
  if (rssi >= -50)
    return { color: "text-green-600", text: t("detail.signalExcellent") };
  if (rssi >= -60)
    return { color: "text-green-500", text: t("detail.signalGood") };
  if (rssi >= -70)
    return { color: "text-yellow-500", text: t("detail.signalFair") };
  return { color: "text-red-500", text: t("detail.signalPoor") };
};

export const DeviceDetailSheet = ({
  device,
  isOpen,
  isUpdating,
  onClose,
  onUpdate,
}: DeviceDetailSheetProps) => {
  const { t } = useTranslation("device-monitoring");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  const [alertThreshold, setAlertThreshold] = useState(0);
  const [description, setDescription] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (device) {
      setAlertThreshold(device.alert_threshold);
      setDescription(device.description ?? "");
      setDeviceName(device.device_name);
      setIsActive(device.is_active);
      setLocation(device.location ?? "");
    }
  }, [device]);

  const { data: metricsData, isLoading: isLoadingMetrics } =
    useGetDeviceMetricListQuery({
      enabled: isOpen && !!device?.id,
      filters: { device_monitoring_id: device?.id ?? "" },
      organizationId,
    });

  if (!device) return null;

  const signal = getSignalStrength(device.last_rssi, t);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(device.id, {
      alert_threshold: alertThreshold,
      description: description || undefined,
      device_name: deviceName,
      is_active: isActive,
      location: location || undefined,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{device.device_name || device.device_id}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="inline-flex rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {device.device_type === "GATE"
                ? t("filter.gate")
                : t("filter.fixedReader")}
            </span>
            <span
              className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${device.status === "ONLINE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {device.status}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t("detail.deviceInfo")}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("table.header.ipAddress")}
                </span>
                <p className="font-mono">{device.ip_address || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("table.header.lastSeen")}
                </span>
                <p>
                  {device.last_seen_at
                    ? formatDateTime(device.last_seen_at)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("table.header.rssi")}
                </span>
                <p className={signal.color}>
                  {device.last_rssi !== null
                    ? `${device.last_rssi} dBm`
                    : "-"}{" "}
                  {signal.text !== "-" && signal.text}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("detail.avgRssi")}
                </span>
                <p>{device.avg_rssi} dBm</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("table.header.scanCount")}
                </span>
                <p>{device.scan_count.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("table.header.errorCount")}
                </span>
                <p>{device.error_count.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("detail.connectionCount")}
                </span>
                <p>{device.connection_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("detail.alertThreshold")}
                </span>
                <p>{device.alert_threshold}</p>
              </div>
              {device.gate && (
                <>
                  <div>
                    <span className="text-muted-foreground">
                      {t("detail.gate")}
                    </span>
                    <p>{device.gate.name}</p>
                  </div>
                  {device.gate.section && (
                    <div>
                      <span className="text-muted-foreground">
                        {t("detail.section")}
                      </span>
                      <p>{device.gate.section.name}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <hr />

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t("detail.updateDevice")}
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("detail.deviceName")}
                </label>
                <Input
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("create.description")}
                </label>
                <Textarea
                  className="resize-none"
                  maxLength={500}
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("create.location")}
                </label>
                <Input
                  maxLength={255}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("detail.alertThreshold")}
                </label>
                <Input
                  max={1000}
                  min={0}
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">
                  {t("detail.isActive")}
                </label>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <div className="flex gap-2">
                <Button disabled={isUpdating} type="submit">
                  {isUpdating ? t("detail.saving") : t("detail.save")}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("detail.cancel")}
                </Button>
              </div>
            </form>
          </div>

          <hr />

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t("detail.metrics")}
            </h3>
            <MetricsChart
              isLoading={isLoadingMetrics}
              metrics={metricsData?.data?.items || []}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
