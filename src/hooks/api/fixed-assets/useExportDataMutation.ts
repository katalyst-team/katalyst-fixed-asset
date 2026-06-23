import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ExportDataResponse,
  exportDataService,
} from "@/services/fixed-assets/exportDataService";
import type { FaExportRequest } from "@/types/fixed-assets";

interface UseExportDataMutationParams {
  organizationId: string;
}

const useExportDataMutation = ({
  organizationId,
}: UseExportDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<ExportDataResponse, Error, FaExportRequest>({
    mutationFn: (data) => exportDataService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Export ready");
      queryClient.invalidateQueries({
        queryKey: ["faExports", organizationId],
      });
    },
  });
};

export default useExportDataMutation;
