import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateGeofenceRuleResponse,
  createGeofenceRuleService,
} from "@/services/fixed-assets/createGeofenceRuleService";
import type { GeofenceRuleRequest } from "@/types/fixed-assets";

interface UseCreateGeofenceRuleMutationParams {
  organizationId: string;
}

const useCreateGeofenceRuleMutation = ({
  organizationId,
}: UseCreateGeofenceRuleMutationParams) => {
  return useMutation<CreateGeofenceRuleResponse, Error, GeofenceRuleRequest>({
    mutationFn: (data) => createGeofenceRuleService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Geofence rules updated successfully");
    },
  });
};

export default useCreateGeofenceRuleMutation;
