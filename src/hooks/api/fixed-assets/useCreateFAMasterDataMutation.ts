import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateFAMasterDataResponse,
  createFAMasterDataService,
} from "@/services/fixed-assets/createFAMasterDataService";
import type {
  CreateMasterDataRequest,
  FaMasterDataSectionTab,
} from "@/types/fixed-assets";

interface UseCreateFAMasterDataMutationParams {
  organizationId: string;
}

interface CreateFAMasterDataVariables {
  data: CreateMasterDataRequest;
  section: FaMasterDataSectionTab;
}

const useCreateFAMasterDataMutation = ({
  organizationId,
}: UseCreateFAMasterDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateFAMasterDataResponse,
    Error,
    CreateFAMasterDataVariables
  >({
    mutationFn: ({ data, section }) =>
      createFAMasterDataService({ data, organizationId, section }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Record created successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMasterData", organizationId],
      });
    },
  });
};

export default useCreateFAMasterDataMutation;
