import { useMutation } from "@tanstack/react-query";
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
    onSuccess: () => {
      toast.success("All reports generation started");
    },
  });
};

export default useGenerateAllReportsMutation;
