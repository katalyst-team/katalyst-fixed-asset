import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  DeleteFAMasterDataResponse,
  deleteFAMasterDataService,
} from "@/services/fixed-assets/deleteFAMasterDataService";
import type { FaMasterDataSectionTab } from "@/types/fixed-assets";

interface UseDeleteFAMasterDataMutationParams {
  organizationId: string;
}

interface DeleteFAMasterDataVariables {
  id: string;
  section: FaMasterDataSectionTab;
}

const useDeleteFAMasterDataMutation = ({
  organizationId,
}: UseDeleteFAMasterDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteFAMasterDataResponse,
    Error,
    DeleteFAMasterDataVariables
  >({
    mutationFn: ({ id, section }) =>
      deleteFAMasterDataService({ id, organizationId, section }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMasterData", organizationId],
      });
    },
  });
};

export default useDeleteFAMasterDataMutation;
