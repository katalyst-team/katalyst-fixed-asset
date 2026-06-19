import { useQuery } from '@tanstack/react-query';

import { getDeviceAlertListService } from '@/services/device-monitoring/getDeviceAlertListService';
import type {
  DeviceAlertFilters,
  DeviceAlertListResponse,
} from '@/types/device-monitoring';

export const KEY_USE_GET_DEVICE_ALERT_LIST = (
  organizationId: string,
  filters?: DeviceAlertFilters,
) => ['device-alert-list', organizationId, JSON.stringify(filters)];

interface UseGetDeviceAlertListQueryProps {
  organizationId: string;
  filters?: DeviceAlertFilters;
  enabled?: boolean;
}

const useGetDeviceAlertListQuery = ({
  organizationId,
  filters,
  enabled = true,
}: UseGetDeviceAlertListQueryProps) => {
  return useQuery<DeviceAlertListResponse>({
    enabled: !!organizationId && enabled,
    queryFn: () => getDeviceAlertListService(organizationId, filters),
    queryKey: KEY_USE_GET_DEVICE_ALERT_LIST(organizationId, filters),
    staleTime: 30 * 1000,
  });
};

export default useGetDeviceAlertListQuery;
