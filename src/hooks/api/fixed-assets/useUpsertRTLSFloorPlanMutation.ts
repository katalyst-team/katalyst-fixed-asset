import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpsertRTLSFloorPlanResponse,
  upsertRTLSFloorPlanService,
} from "@/services/fixed-assets/getRTLSFloorPlanService";
import type { UpsertRTLSFloorPlanRequest } from "@/types/fixed-assets";

interface UseUpsertRTLSFloorPlanMutationParams {
  organizationId: string;
}

const useUpsertRTLSFloorPlanMutation = ({
  organizationId,
}: UseUpsertRTLSFloorPlanMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpsertRTLSFloorPlanResponse,
    Error,
    UpsertRTLSFloorPlanRequest
  >({
    mutationFn: (data) =>
      upsertRTLSFloorPlanService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Floor plan saved");
      queryClient.invalidateQueries({ queryKey: ["faRTLSFloorPlan", organizationId] });
    },
  });
};

export default useUpsertRTLSFloorPlanMutation;
