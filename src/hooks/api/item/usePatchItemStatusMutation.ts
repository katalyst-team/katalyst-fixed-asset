import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { ApiResponse } from "@/services";
import {
  patchItemStatusService,
  PatchItemStatusServiceParams,
} from "@/services/item/patchItemStatusService";

export const USE_PATCH_ITEM_STATUS_MUTATION_KEY = () => ["patchItemStatus"];

interface UsePatchItemStatusMutationProps {
  onSuccess?: (data: ApiResponse<{ id: string }>) => void;
}

const usePatchItemStatusMutation = ({
  onSuccess,
}: UsePatchItemStatusMutationProps = {}): UseMutationResult<
  ApiResponse<{ id: string }>,
  Error,
  PatchItemStatusServiceParams,
  unknown
> => {
  return useMutation({
    mutationFn: patchItemStatusService,
    mutationKey: USE_PATCH_ITEM_STATUS_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (data) => {
      toast.success("Item status updated successfully");
      onSuccess?.(data);
    },
  });
};

export default usePatchItemStatusMutation;
