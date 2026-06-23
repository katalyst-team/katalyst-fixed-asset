import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  EncodeRFIDTagResponse,
  encodeRFIDTagService,
} from "@/services/fixed-assets/encodeRFIDTagService";
import type { EncodeRFIDTagRequest } from "@/types/fixed-assets";

interface UseEncodeRFIDTagMutationParams {
  organizationId: string;
}

const useEncodeRFIDTagMutation = ({
  organizationId,
}: UseEncodeRFIDTagMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<EncodeRFIDTagResponse, Error, EncodeRFIDTagRequest>({
    mutationFn: (data) => encodeRFIDTagService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Tag encoded successfully");
      queryClient.invalidateQueries({
        queryKey: ["faRfidTags", organizationId],
      });
    },
  });
};

export default useEncodeRFIDTagMutation;
