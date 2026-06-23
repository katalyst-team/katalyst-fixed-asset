import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateFAMasterDataResponse,
  updateFAMasterDataService,
} from "@/services/fixed-assets/updateFAMasterDataService";
import type {
  CreateMasterDataRequest,
  FaMasterDataSectionTab,
} from "@/types/fixed-assets";

interface UseUpdateFAMasterDataMutationParams {
  organizationId: string;
}

interface UpdateFAMasterDataVariables {
  data: Partial<CreateMasterDataRequest>;
  id: string;
  section: FaMasterDataSectionTab;
}

const useUpdateFAMasterDataMutation = ({
  organizationId,
}: UseUpdateFAMasterDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateFAMasterDataResponse,
    Error,
    UpdateFAMasterDataVariables
  >({
    mutationFn: ({ data, id, section }) =>
      updateFAMasterDataService({ data, id, organizationId, section }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Record updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMasterData", organizationId],
      });
    },
  });
};

export default useUpdateFAMasterDataMutation;
