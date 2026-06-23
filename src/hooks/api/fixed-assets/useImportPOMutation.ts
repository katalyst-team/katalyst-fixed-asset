import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ImportPOResponse,
  importPOService,
} from "@/services/fixed-assets/importPOService";

interface UseImportPOMutationParams {
  organizationId: string;
}

const useImportPOMutation = ({
  organizationId,
}: UseImportPOMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<ImportPOResponse, Error, { file: File }>({
    mutationFn: ({ file }) => importPOService({ file, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("PO imported successfully");
      queryClient.invalidateQueries({
        queryKey: ["faPO", organizationId],
      });
    },
  });
};

export default useImportPOMutation;
