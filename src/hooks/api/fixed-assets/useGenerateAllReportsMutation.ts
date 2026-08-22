import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  GenerateAllReportsResponse,
  generateAllReportsService,
} from "@/services/fixed-assets/generateAllReportsService";
import type { FaReportFormat } from "@/types/fixed-assets";

interface UseGenerateAllReportsMutationParams {
  organizationId: string;
}

interface GenerateAllReportsVariables {
  format: FaReportFormat;
}

const useGenerateAllReportsMutation = ({
  organizationId,
}: UseGenerateAllReportsMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    GenerateAllReportsResponse,
    Error,
    GenerateAllReportsVariables
  >({
    mutationFn: ({ format }) =>
      generateAllReportsService({
        data: { format },
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (response) => {
      const ready = response?.data?.filter((r) => r.status === "ready") ?? [];
      if (ready.length > 0) {
        toast.success(`${ready.length} reports generated — check History`);
      } else {
        toast.info("No reports could be generated");
      }
      queryClient.invalidateQueries({ queryKey: ["faReportTemplates", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["faReportHistory", organizationId] });
    },
  });
};

export default useGenerateAllReportsMutation;
