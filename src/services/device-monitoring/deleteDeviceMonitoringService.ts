import type { DeleteDeviceMonitoringResponse } from '@/types/device-monitoring';

import fetcher from '..';

export const deleteDeviceMonitoringService = (
  organizationId: string,
  deviceMonitoringId: string,
): Promise<DeleteDeviceMonitoringResponse> => {
  return fetcher({
    method: 'DELETE',
    url: `/v1/organizations/${organizationId}/device-monitoring/${deviceMonitoringId}`,
  });
};
