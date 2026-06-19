import { useQuery } from '@tanstack/react-query';

import { getDeviceMetricListService } from '@/services/device-monitoring/getDeviceMetricListService';
import type {
  DeviceMetricFilters,
  DeviceMetricListResponse,
} from '@/types/device-monitoring';

export const KEY_USE_GET_DEVICE_METRIC_LIST = (
  organizationId: string,
  filters: DeviceMetricFilters,
) => ['device-metric-list', organizationId, JSON.stringify(filters)];

interface UseGetDeviceMetricListQueryProps {
  organizationId: string;
  filters: DeviceMetricFilters;
  enabled?: boolean;
}

const useGetDeviceMetricListQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetDeviceMetricListQueryProps) => {
  return useQuery<DeviceMetricListResponse>({
    enabled: !!organizationId && !!filters.device_monitoring_id && enabled,
    queryFn: () => getDeviceMetricListService(organizationId, filters),
    queryKey: KEY_USE_GET_DEVICE_METRIC_LIST(organizationId, filters),
    staleTime: 30 * 1000,
  });
};

export default useGetDeviceMetricListQuery;