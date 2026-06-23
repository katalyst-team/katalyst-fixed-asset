import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  AuditSignOffResponse,
  auditSignOffService,
} from "@/services/fixed-assets/auditSignOffService";
import type { AuditSignOffRequest } from "@/types/fixed-assets";

interface UseAuditSignOffMutationParams {
  organizationId: string;
}

interface AuditSignOffVariables {
  auditId: string;
  data: AuditSignOffRequest;
}

const useAuditSignOffMutation = ({
  organizationId,
}: UseAuditSignOffMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    AuditSignOffResponse,
    Error,
    AuditSignOffVariables
  >({
    mutationFn: ({ auditId, data }) =>
      auditSignOffService({ auditId, data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (response) => {
      toast.success("Sign-off submitted successfully");
      queryClient.invalidateQueries({
        queryKey: ["faAuditZones", organizationId],
      });
      if (response.data.remaining_signoffs === 0) {
        toast.success("All sign-offs complete — audit finalized");
      }
    },
  });
};

export default useAuditSignOffMutation;
