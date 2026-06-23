import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  GetAuditReportResponse,
  getAuditReportService,
} from "@/services/fixed-assets/getAuditReportService";

interface UseGetAuditReportMutationParams {
  organizationId: string;
}

const useGetAuditReportMutation = ({
  organizationId,
}: UseGetAuditReportMutationParams) => {
  return useMutation<GetAuditReportResponse, Error, { auditId: string }>({
    mutationFn: ({ auditId }) =>
      getAuditReportService({ auditId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Audit report generated");
    },
  });
};

export default useGetAuditReportMutation;
