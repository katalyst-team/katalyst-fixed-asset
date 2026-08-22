import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  GenerateReportResponse,
  generateReportService,
} from "@/services/fixed-assets/generateReportService";
import type { GenerateReportRequest } from "@/types/fixed-assets";

interface UseGenerateReportMutationParams {
  organizationId: string;
}

const useGenerateReportMutation = ({
  organizationId,
}: UseGenerateReportMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<GenerateReportResponse, Error, GenerateReportRequest>({
    mutationFn: (data) => generateReportService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (response) => {
      if (response.data.status === "ready" && response.data.download_url) {
        toast.success("Report ready — downloading");
        window.open(response.data.download_url, "_blank");
      } else {
        toast.success("Report generation started");
      }
      queryClient.invalidateQueries({ queryKey: ["faReportTemplates", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["faReportHistory", organizationId] });
    },
  });
};

export default useGenerateReportMutation;
