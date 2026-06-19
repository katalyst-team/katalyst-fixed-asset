import { useMutation } from '@tanstack/react-query';

import {
  updateDeviceMonitoringService,
} from '@/services/device-monitoring/getDeviceMonitoringListService';
import type {
  DeviceMonitoringDetailResponse,
  UpdateDeviceMonitoringPayload,
} from '@/types/device-monitoring';

export const KEY_USE_UPDATE_DEVICE_MONITORING = () => [
  'update-device-monitoring',
];

interface UseUpdateDeviceMonitoringMutationProps {
  onSuccess?: (data: DeviceMonitoringDetailResponse) => void;
  onError?: (error: Error) => void;
}

const useUpdateDeviceMonitoringMutation = ({
  onSuccess,
  onError,
}: UseUpdateDeviceMonitoringMutationProps) => {
  return useMutation<
    DeviceMonitoringDetailResponse,
    Error,
    {
      organizationId: string;
      deviceMonitoringId: string;
      payload: UpdateDeviceMonitoringPayload;
    }
  >({
    mutationFn: ({ organizationId, deviceMonitoringId, payload }) =>
      updateDeviceMonitoringService(organizationId, deviceMonitoringId, payload),
    mutationKey: KEY_USE_UPDATE_DEVICE_MONITORING(),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export default useUpdateDeviceMonitoringMutation;