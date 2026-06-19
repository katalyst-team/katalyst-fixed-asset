"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import {
  useGetDeviceAlertListQuery,
  useGetDeviceMonitoringListQuery,
  useGetDeviceMonitoringStatsQuery,
} from "@/hooks/api/device-monitoring";
import type {
  DeviceAlert,
  DeviceMonitoring,
  DeviceMonitoringStats,
} from "@/types/device-monitoring";

import { useDeviceMonitoringStore } from "./store/DeviceMonitoringStore";

interface UseDeviceMonitoringReturn {
  alerts: DeviceAlert[];
  devicePagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
    total_count: number;
  };
  devices: DeviceMonitoring[];
  isLoadingAlerts: boolean;
  isLoadingDevices: boolean;
  isLoadingStats: boolean;
  stats: DeviceMonitoringStats | null;
}

export const useDeviceMonitoring = (): UseDeviceMonitoringReturn => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const itemsPerPage = useDeviceMonitoringStore((state) => state.itemLimit);
  const filters = useDeviceMonitoringStore(
    useShallow((state) => state.filters),
  );

  const requestFilters = useMemo(
    () => ({
      cursor: filters.cursor ?? undefined,
      device_type: filters.deviceType,
      limit: itemsPerPage,
      search: filters.search,
      status: filters.status,
    }),
    [filters, itemsPerPage],
  );

  const {
    data: devicesData,
    isFetching: isFetchingDevices,
    isLoading: isLoadingDevices,
  } = useGetDeviceMonitoringListQuery({
    filters: requestFilters,
    organizationId,
  });

  const {
    data: statsData,
    isFetching: isFetchingStats,
    isLoading: isLoadingStats,
  } = useGetDeviceMonitoringStatsQuery({
    organizationId,
  });

  const {
    data: alertsData,
    isFetching: isFetchingAlerts,
    isLoading: isLoadingAlerts,
  } = useGetDeviceAlertListQuery({
    filters: { limit: 20 },
    organizationId,
  });

  return {
    alerts: alertsData?.data?.items || [],
    devicePagination: {
      count: devicesData?.pagination?.count ?? 0,
      next_cursor: devicesData?.pagination?.next_cursor ?? null,
      prev_cursor: devicesData?.pagination?.prev_cursor ?? null,
      total_count: devicesData?.pagination?.total_count ?? 0,
    },
    devices: devicesData?.data?.items || [],
    isLoadingAlerts: isLoadingAlerts || isFetchingAlerts,
    isLoadingDevices: isLoadingDevices || isFetchingDevices,
    isLoadingStats: isLoadingStats || isFetchingStats,
    stats: statsData?.data || null,
  };
};
