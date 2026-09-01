import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateRfidTagResponse,
  updateRfidTagService,
} from "@/services/fixed-assets/updateRfidTagService";
import type { UpdateFaRfidTagRequest } from "@/types/fixed-assets";

interface UseUpdateRFIDTagMutationParams {
  organizationId: string;
}

const useUpdateRFIDTagMutation = ({
  organizationId,
}: UseUpdateRFIDTagMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateRfidTagResponse,
    Error,
    { data: UpdateFaRfidTagRequest; tagId: string }
  >({
    mutationFn: ({ data, tagId }) =>
      updateRfidTagService({ data, organizationId, tagId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Tag updated");
      queryClient.invalidateQueries({
        queryKey: ["faRfidTags", organizationId],
      });
    },
  });
};

export default useUpdateRFIDTagMutation;
