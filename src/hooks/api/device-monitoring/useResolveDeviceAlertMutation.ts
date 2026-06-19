import { useMutation } from '@tanstack/react-query';

import { resolveDeviceAlertService } from '@/services/device-monitoring/getDeviceAlertListService';
import type { DeviceAlertListResponse } from '@/types/device-monitoring';

export const KEY_USE_RESOLVE_DEVICE_ALERT = () => ['resolve-device-alert'];

interface UseResolveDeviceAlertMutationProps {
  onSuccess?: (data: DeviceAlertListResponse) => void;
  onError?: (error: Error) => void;
}

const useResolveDeviceAlertMutation = ({
  onSuccess,
  onError,
}: UseResolveDeviceAlertMutationProps) => {
  return useMutation<
    DeviceAlertListResponse,
    Error,
    {
      organizationId: string;
      deviceAlertId: string;
    }
  >({
    mutationFn: ({ organizationId, deviceAlertId }) =>
      resolveDeviceAlertService(organizationId, deviceAlertId),
    mutationKey: KEY_USE_RESOLVE_DEVICE_ALERT(),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export default useResolveDeviceAlertMutation;