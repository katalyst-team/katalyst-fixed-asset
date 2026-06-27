import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  type CreateLifecycleEventRequest,
  createLifecycleEventService,
} from "@/services/fixed-assets/createLifecycleEventService";

import { KEY_USE_GET_FA_LIFECYCLE } from "./useGetAssetLifecycleQuery";
import { KEY_USE_GET_FA_LIFECYCLE_SUMMARY } from "./useGetLifecycleSummaryQuery";

interface UseCreateLifecycleEventMutationParams {
  organizationId: string;
}

const useCreateLifecycleEventMutation = ({
  organizationId,
}: UseCreateLifecycleEventMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { assetId: string; data: CreateLifecycleEventRequest }) =>
      createLifecycleEventService({
        assetId: params.assetId,
        data: params.data,
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_LIFECYCLE(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_FA_LIFECYCLE_SUMMARY(organizationId),
      });
      toast.success("Lifecycle event recorded");
    },
  });
};

export default useCreateLifecycleEventMutation;
