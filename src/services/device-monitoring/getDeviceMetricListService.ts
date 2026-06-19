import type {
  DeviceMetricFilters,
  DeviceMetricListResponse,
} from '@/types/device-monitoring';

import fetcher from '..';

export const getDeviceMetricListService = (
  organizationId: string,
  filters: DeviceMetricFilters,
): Promise<DeviceMetricListResponse> => {
  const params = new URLSearchParams();
  params.append('device_monitoring_id', filters.device_monitoring_id.toString());
  if (filters?.from_timestamp)
    params.append('from_timestamp', filters.from_timestamp);
  if (filters?.to_timestamp)
    params.append('to_timestamp', filters.to_timestamp);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.cursor) params.append('cursor', filters.cursor);

  const qs = params.toString();
  return fetcher({
    method: 'GET',
    url: `/v1/organizations/${organizationId}/device-monitoring/metrics?${qs}`,
  });
};
