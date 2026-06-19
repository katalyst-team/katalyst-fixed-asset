import { useMutation } from '@tanstack/react-query';

import { createDeviceMonitoringService } from '@/services/device-monitoring/createDeviceMonitoringService';
import type {
  CreateDeviceMonitoringPayload,
  CreateDeviceMonitoringResponse,
} from '@/types/device-monitoring';

export const KEY_USE_CREATE_DEVICE_MONITORING = () => [
  'create-device-monitoring',
];

interface UseCreateDeviceMonitoringMutationProps {
  onError?: (error: Error) => void;
  onSuccess?: (data: CreateDeviceMonitoringResponse) => void;
}

const useCreateDeviceMonitoringMutation = ({
  onError,
  onSuccess,
}: UseCreateDeviceMonitoringMutationProps) => {
  return useMutation<
    CreateDeviceMonitoringResponse,
    Error,
    {
      organizationId: string;
      payload: CreateDeviceMonitoringPayload;
    }
  >({
    mutationFn: ({ organizationId, payload }) =>
      createDeviceMonitoringService(organizationId, payload),
    mutationKey: KEY_USE_CREATE_DEVICE_MONITORING(),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export default useCreateDeviceMonitoringMutation;
