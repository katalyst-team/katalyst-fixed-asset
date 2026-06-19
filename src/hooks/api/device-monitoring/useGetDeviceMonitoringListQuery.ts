import { useQuery } from '@tanstack/react-query';

import {
  getDeviceMonitoringDetailService,
  getDeviceMonitoringListService,
  getDeviceMonitoringStatsService,
} from '@/services/device-monitoring/getDeviceMonitoringListService';
import type {
  DeviceMonitoringDetailResponse,
  DeviceMonitoringFilters,
  DeviceMonitoringListResponse,
  DeviceMonitoringStatsResponse,
} from '@/types/device-monitoring';

export const KEY_USE_GET_DEVICE_MONITORING_LIST = (
  organizationId: string,
  filters?: DeviceMonitoringFilters,
) => ['device-monitoring-list', organizationId, JSON.stringify(filters)];

export const KEY_USE_GET_DEVICE_MONITORING_STATS = (
  organizationId: string,
) => ['device-monitoring-stats', organizationId];

export const KEY_USE_GET_DEVICE_MONITORING_DETAIL = (
  organizationId: string,
  deviceMonitoringId: string,
) => ['device-monitoring-detail', organizationId, deviceMonitoringId];

interface UseGetDeviceMonitoringListQueryProps {
  organizationId: string;
  filters?: DeviceMonitoringFilters;
  enabled?: boolean;
}

const useGetDeviceMonitoringListQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetDeviceMonitoringListQueryProps) => {
  return useQuery<DeviceMonitoringListResponse>({
    enabled: !!organizationId && enabled,
    queryFn: () => getDeviceMonitoringListService(organizationId, filters),
    queryKey: KEY_USE_GET_DEVICE_MONITORING_LIST(organizationId, filters),
    staleTime: 30 * 1000,
  });
};

export default useGetDeviceMonitoringListQuery;

interface UseGetDeviceMonitoringStatsQueryProps {
  organizationId: string;
  enabled?: boolean;
}

export const useGetDeviceMonitoringStatsQuery = ({
  organizationId,
  enabled = true,
}: UseGetDeviceMonitoringStatsQueryProps) => {
  return useQuery<DeviceMonitoringStatsResponse>({
    enabled: !!organizationId && enabled,
    queryFn: () => getDeviceMonitoringStatsService(organizationId),
    queryKey: KEY_USE_GET_DEVICE_MONITORING_STATS(organizationId),
    staleTime: 30 * 1000,
  });
};

interface UseGetDeviceMonitoringDetailQueryProps {
  organizationId: string;
  deviceMonitoringId: string;
  enabled?: boolean;
}

export const useGetDeviceMonitoringDetailQuery = ({
  organizationId,
  deviceMonitoringId,
  enabled = true,
}: UseGetDeviceMonitoringDetailQueryProps) => {
  return useQuery<DeviceMonitoringDetailResponse>({
    enabled: !!organizationId && !!deviceMonitoringId && enabled,
    queryFn: () =>
      getDeviceMonitoringDetailService(organizationId, deviceMonitoringId),
    queryKey: KEY_USE_GET_DEVICE_MONITORING_DETAIL(
      organizationId,
      deviceMonitoringId,
    ),
  });
};
