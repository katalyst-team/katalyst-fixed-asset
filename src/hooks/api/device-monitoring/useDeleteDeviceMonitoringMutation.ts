import { useMutation } from '@tanstack/react-query';

import { deleteDeviceMonitoringService } from '@/services/device-monitoring/deleteDeviceMonitoringService';
import type { DeleteDeviceMonitoringResponse } from '@/types/device-monitoring';

export const KEY_USE_DELETE_DEVICE_MONITORING = () => [
  'delete-device-monitoring',
];

interface UseDeleteDeviceMonitoringMutationProps {
  onError?: (error: Error) => void;
  onSuccess?: (data: DeleteDeviceMonitoringResponse) => void;
}

const useDeleteDeviceMonitoringMutation = ({
  onError,
  onSuccess,
}: UseDeleteDeviceMonitoringMutationProps) => {
  return useMutation<
    DeleteDeviceMonitoringResponse,
    Error,
    {
      deviceMonitoringId: string;
      organizationId: string;
    }
  >({
    mutationFn: ({ organizationId, deviceMonitoringId }) =>
      deleteDeviceMonitoringService(organizationId, deviceMonitoringId),
    mutationKey: KEY_USE_DELETE_DEVICE_MONITORING(),
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
};

export default useDeleteDeviceMonitoringMutation;
