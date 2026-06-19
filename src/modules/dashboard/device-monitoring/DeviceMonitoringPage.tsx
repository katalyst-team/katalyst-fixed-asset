"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import {
  useCreateDeviceMonitoringMutation,
  useDeleteDeviceMonitoringMutation,
  useResolveDeviceAlertMutation,
  useUpdateDeviceMonitoringMutation,
} from "@/hooks/api/device-monitoring";
import {
  AlertList,
  CreateDeviceDialog,
  DeviceDetailSheet,
  DeviceTable,
  DeviceTableFilters,
  StatsCards,
  useDeviceMonitoring,
  useDeviceMonitoringStore,
} from "@/modules/device-monitoring";
import { toastError } from "@/services";
import type {
  CreateDeviceMonitoringPayload,
  DeviceAlert,
  DeviceMonitoring,
  DeviceStatus,
  DeviceType,
  UpdateDeviceMonitoringPayload,
} from "@/types/device-monitoring";

function DeviceMonitoringContent() {
  const { t } = useTranslation("device-monitoring");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const urlInitialized = useRef(false);

  const {
    alerts,
    devicePagination,
    devices,
    isLoadingAlerts,
    isLoadingDevices,
    isLoadingStats,
    stats,
  } = useDeviceMonitoring();

  const filters = useDeviceMonitoringStore(
    useShallow((state) => state.filters),
  );
  const setFilters = useDeviceMonitoringStore((state) => state.setFilters);
  const currentPage = useDeviceMonitoringStore((state) => state.currentPage);
  const goToNextPage = useDeviceMonitoringStore((state) => state.goToNextPage);
  const goToPrevPage = useDeviceMonitoringStore((state) => state.goToPrevPage);
  const resetPagination = useDeviceMonitoringStore(
    (state) => state.resetPagination,
  );

  const [selectedDevice, setSelectedDevice] =
    useState<DeviceMonitoring | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      deviceType: (q.device_type as DeviceType) ?? prev.deviceType,
      search: q.search ?? prev.search,
      status: (q.status as DeviceStatus) ?? prev.status,
    }));
  }, [router.isReady, router.query, setFilters]);

  const syncFiltersToURL = (newFilters: {
    deviceType?: DeviceType;
    search?: string;
    status?: DeviceStatus;
  }) => {
    const query: Record<string, string> = {};
    if (newFilters.deviceType) query.device_type = newFilters.deviceType;
    if (newFilters.search) query.search = newFilters.search;
    if (newFilters.status) query.status = newFilters.status;
    void router.replace(
      { pathname: router.pathname, query },
      undefined,
      { shallow: true },
    );
  };

  const handleFilterChange = (newFilters: {
    deviceType?: DeviceType;
    search?: string;
    status?: DeviceStatus;
  }) => {
    const merged = {
      deviceType: filters.deviceType,
      search: filters.search,
      status: filters.status,
      ...newFilters,
    };
    setFilters((prev) => ({ ...prev, ...newFilters, cursor: undefined }));
    resetPagination();
    syncFiltersToURL(merged);
  };

  const handleNextPage = () => {
    if (devicePagination.next_cursor) {
      goToNextPage(devicePagination.next_cursor);
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["device-monitoring-list"] });
    queryClient.invalidateQueries({ queryKey: ["device-monitoring-stats"] });
    queryClient.invalidateQueries({ queryKey: ["device-monitoring-detail"] });
  };

  const resolveAlertMutation = useResolveDeviceAlertMutation({
    onError: () => {
      toastError(new Error(t("alerts.resolveError")));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-alert-list"] });
      queryClient.invalidateQueries({ queryKey: ["device-monitoring-stats"] });
    },
  });

  const handleResolveAlert = (alert: DeviceAlert) => {
    resolveAlertMutation.mutate({ deviceAlertId: alert.id, organizationId });
  };

  const updateMutation = useUpdateDeviceMonitoringMutation({
    onError: () => {
      toastError(new Error(t("detail.updateError")));
    },
    onSuccess: () => {
      invalidateAll();
      setSelectedDevice(null);
    },
  });

  const handleUpdateDevice = (
    deviceId: string,
    payload: UpdateDeviceMonitoringPayload,
  ) => {
    updateMutation.mutate({ deviceMonitoringId: deviceId, organizationId, payload });
  };

  const createMutation = useCreateDeviceMonitoringMutation({
    onError: () => {
      toastError(new Error(t("create.error")));
    },
    onSuccess: () => {
      invalidateAll();
      setIsCreateOpen(false);
    },
  });

  const handleCreateDevice = (payload: CreateDeviceMonitoringPayload) => {
    createMutation.mutate({ organizationId, payload });
  };

  const deleteMutation = useDeleteDeviceMonitoringMutation({
    onError: () => {
      toastError(new Error(t("delete.error")));
    },
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["device-alert-list"] });
    },
  });

  const handleDeleteDevice = (device: DeviceMonitoring) => {
    deleteMutation.mutate({ deviceMonitoringId: device.id, organizationId });
  };

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("title")}</h1>
          <p className="ks-page-desc">{t("description")}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          {t("create.trigger")}
        </Button>
      </div>

      <StatsCards isLoading={isLoadingStats} stats={stats} />

      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">{t("table.title")}</div>
        </div>
        <div className="ks-card-body">
          <DeviceTableFilters
            filters={{
              deviceType: filters.deviceType,
              search: filters.search,
              status: filters.status,
            }}
            onFilterChange={handleFilterChange}
          />
          <DeviceTable
            devices={devices}
            isLoading={isLoadingDevices}
            onDeleteDevice={handleDeleteDevice}
            onRowClick={setSelectedDevice}
          />
          <div className="mt-4 flex justify-end">
            <PaginationCursor
              currentPage={currentPage}
              hasNextPage={Boolean(devicePagination.next_cursor)}
              hasPrevPage={currentPage > 1}
              onNext={handleNextPage}
              onPrev={goToPrevPage}
            />
          </div>
        </div>
      </div>

      <div className="ks-card mt-4">
        <div className="ks-card-head">
          <div className="ks-card-title">{t("alerts.title")}</div>
        </div>
        <div className="ks-card-body">
          <AlertList
            alerts={alerts}
            isLoading={isLoadingAlerts}
            onResolveAlert={handleResolveAlert}
          />
        </div>
      </div>

      <DeviceDetailSheet
        device={selectedDevice}
        isOpen={!!selectedDevice}
        isUpdating={updateMutation.isPending}
        onClose={() => setSelectedDevice(null)}
        onUpdate={handleUpdateDevice}
      />

      <CreateDeviceDialog
        isCreating={createMutation.isPending}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateDevice}
      />
    </div>
  );
}

const DeviceMonitoringPage = () => {
  return <DeviceMonitoringContent />;
};

export default DeviceMonitoringPage;
