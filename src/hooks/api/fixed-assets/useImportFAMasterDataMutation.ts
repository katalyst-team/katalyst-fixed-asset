import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ImportFAMasterDataResponse,
  importFAMasterDataService,
} from "@/services/fixed-assets/importFAMasterDataService";
import type { FaMasterDataSectionTab } from "@/types/fixed-assets";

interface UseImportFAMasterDataMutationParams {
  organizationId: string;
}

interface ImportFAMasterDataVariables {
  file: File;
  section: FaMasterDataSectionTab;
}

const useImportFAMasterDataMutation = ({
  organizationId,
}: UseImportFAMasterDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ImportFAMasterDataResponse,
    Error,
    ImportFAMasterDataVariables
  >({
    mutationFn: ({ file, section }) =>
      importFAMasterDataService({ file, organizationId, section }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Import completed successfully");
      queryClient.invalidateQueries({
        queryKey: ["faMasterData", organizationId],
      });
    },
  });
};

export default useImportFAMasterDataMutation;
