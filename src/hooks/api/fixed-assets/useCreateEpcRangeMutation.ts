import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateEpcRangeResponse,
  createEpcRangeService,
} from "@/services/fixed-assets/createEpcRangeService";
import type { CreateEpcRangeRequest } from "@/types/fixed-assets";

interface UseCreateEpcRangeMutationParams {
  organizationId: string;
}

const useCreateEpcRangeMutation = ({
  organizationId,
}: UseCreateEpcRangeMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateEpcRangeResponse, Error, CreateEpcRangeRequest>({
    mutationFn: (data) => createEpcRangeService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("EPC range registered");
      queryClient.invalidateQueries({
        queryKey: ["faEpcRanges", organizationId],
      });
    },
  });
};

export default useCreateEpcRangeMutation;
