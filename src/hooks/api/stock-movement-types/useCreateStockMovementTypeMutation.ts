import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  CreateStockMovementTypeParams,
  CreateStockMovementTypeResponse,
  createStockMovementTypeService,
} from "@/services/stock-movement-types/createStockMovementTypeService";

interface UseCreateStockMovementTypeMutationProps {
  organizationId: string;
  onSuccess?: (data: CreateStockMovementTypeResponse) => void;
  onError?: (error: unknown) => void;
}

const useCreateStockMovementTypeMutation = ({
  organizationId,
  onSuccess,
  onError,
}: UseCreateStockMovementTypeMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateStockMovementTypeResponse,
    unknown,
    Omit<CreateStockMovementTypeParams, "organization_id">
  >({
    mutationFn: (payload) =>
      createStockMovementTypeService({ ...payload, organization_id: organizationId }),
    onError: (error) => {
      toast.error("Failed to create stock movement type");
      if (onError) {
        onError(error);
      }
    },
    onSuccess: (data) => {
      toast.success("Stock movement type created successfully");
      queryClient.invalidateQueries({
        queryKey: ["stock-movement-types-list", organizationId],
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export default useCreateStockMovementTypeMutation;
