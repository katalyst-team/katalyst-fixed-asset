import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  UpdateStockMovementTypeParams,
  UpdateStockMovementTypeResponse,
  updateStockMovementTypeService,
} from "@/services/stock-movement-types/updateStockMovementTypeService";

interface UseUpdateStockMovementTypeMutationProps {
  organizationId: string;
  onSuccess?: (data: UpdateStockMovementTypeResponse) => void;
  onError?: (error: unknown) => void;
}

const useUpdateStockMovementTypeMutation = ({
  organizationId,
  onSuccess,
  onError,
}: UseUpdateStockMovementTypeMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateStockMovementTypeResponse,
    unknown,
    Omit<UpdateStockMovementTypeParams, "organization_id">
  >({
    mutationFn: (payload) =>
      updateStockMovementTypeService({ ...payload, organization_id: organizationId }),
    onError: (error) => {
      toast.error("Failed to update stock movement type");
      if (onError) {
        onError(error);
      }
    },
    onSuccess: (data) => {
      toast.success("Stock movement type updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["stock-movement-types-list", organizationId],
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export default useUpdateStockMovementTypeMutation;
