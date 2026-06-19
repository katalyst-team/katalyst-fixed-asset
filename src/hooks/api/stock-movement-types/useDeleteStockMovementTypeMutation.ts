import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  DeleteStockMovementTypeParams,
  DeleteStockMovementTypeResponse,
  deleteStockMovementTypeService,
} from "@/services/stock-movement-types/deleteStockMovementTypeService";

interface UseDeleteStockMovementTypeMutationProps {
  organizationId: string;
  onSuccess?: (data: DeleteStockMovementTypeResponse) => void;
  onError?: (error: unknown) => void;
}

const useDeleteStockMovementTypeMutation = ({
  organizationId,
  onSuccess,
  onError,
}: UseDeleteStockMovementTypeMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteStockMovementTypeResponse,
    unknown,
    Omit<DeleteStockMovementTypeParams, "organization_id">
  >({
    mutationFn: (payload) =>
      deleteStockMovementTypeService({ ...payload, organization_id: organizationId }),
    onError: (error) => {
      toast.error("Failed to delete stock movement type");
      if (onError) {
        onError(error);
      }
    },
    onSuccess: (data) => {
      toast.success("Stock movement type deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["stock-movement-types-list", organizationId],
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export default useDeleteStockMovementTypeMutation;
