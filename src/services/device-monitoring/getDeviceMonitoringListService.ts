import type {
  DeviceMonitoringDetailResponse,
  DeviceMonitoringFilters,
  DeviceMonitoringListResponse,
  DeviceMonitoringStatsResponse,
  UpdateDeviceMonitoringPayload,
} from '@/types/device-monitoring';

import fetcher from '..';

export const getDeviceMonitoringListService = (
  organizationId: string,
  filters?: DeviceMonitoringFilters,
): Promise<DeviceMonitoringListResponse> => {
  const params = new URLSearchParams();
  if (filters?.device_type) params.append('device_type', filters.device_type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.cursor) params.append('cursor', filters.cursor);

  const qs = params.toString();
  return fetcher({
    method: 'GET',
    url: `/v1/organizations/${organizationId}/device-monitoring${qs ? `?${qs}` : ''}`,
  });
};

export const getDeviceMonitoringDetailService = (
  organizationId: string,
  deviceMonitoringId: string,
): Promise<DeviceMonitoringDetailResponse> => {
  return fetcher({
    method: 'GET',
    url: `/v1/organizations/${organizationId}/device-monitoring/${deviceMonitoringId}`,
  });
};

export const getDeviceMonitoringStatsService = (
  organizationId: string,
): Promise<DeviceMonitoringStatsResponse> => {
  return fetcher({
    method: 'GET',
    url: `/v1/organizations/${organizationId}/device-monitoring/stats`,
  });
};

export const updateDeviceMonitoringService = (
  organizationId: string,
  deviceMonitoringId: string,
  payload: UpdateDeviceMonitoringPayload,
): Promise<DeviceMonitoringDetailResponse> => {
  return fetcher({
    data: payload,
    method: 'PUT',
    url: `/v1/organizations/${organizationId}/device-monitoring/${deviceMonitoringId}`,
  });
};
