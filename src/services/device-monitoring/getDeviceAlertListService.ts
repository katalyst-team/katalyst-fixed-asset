import type {
  DeviceAlertFilters,
  DeviceAlertListResponse,
} from '@/types/device-monitoring';

import fetcher from '..';

export const getDeviceAlertListService = (
  organizationId: string,
  filters?: DeviceAlertFilters,
): Promise<DeviceAlertListResponse> => {
  const params = new URLSearchParams();
  if (filters?.device_monitoring_id)
    params.append('device_monitoring_id', filters.device_monitoring_id.toString());
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.is_resolved !== undefined)
    params.append('is_resolved', filters.is_resolved.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.cursor) params.append('cursor', filters.cursor);

  const qs = params.toString();
  return fetcher({
    method: 'GET',
    url: `/v1/organizations/${organizationId}/device-monitoring/alerts${qs ? `?${qs}` : ''}`,
  });
};

export const resolveDeviceAlertService = (
  organizationId: string,
  deviceAlertId: string,
): Promise<DeviceAlertListResponse> => {
  return fetcher({
    method: 'PUT',
    url: `/v1/organizations/${organizationId}/device-monitoring/alerts/${deviceAlertId}/resolve`,
  });
};
