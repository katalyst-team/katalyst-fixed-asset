import type {
  CreateDeviceMonitoringPayload,
  CreateDeviceMonitoringResponse,
} from '@/types/device-monitoring';

import fetcher from '..';

export const createDeviceMonitoringService = (
  organizationId: string,
  payload: CreateDeviceMonitoringPayload,
): Promise<CreateDeviceMonitoringResponse> => {
  return fetcher({
    data: payload,
    method: 'POST',
    url: `/v1/organizations/${organizationId}/device-monitoring`,
  });
};
