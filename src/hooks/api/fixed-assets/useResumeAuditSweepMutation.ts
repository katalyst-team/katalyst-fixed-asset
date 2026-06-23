import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  ResumeAuditSweepResponse,
  resumeAuditSweepService,
} from "@/services/fixed-assets/resumeAuditSweepService";

interface UseResumeAuditSweepMutationParams {
  organizationId: string;
}

interface ResumeAuditSweepVariables {
  auditId: string;
  zone_id: string;
}

const useResumeAuditSweepMutation = ({
  organizationId,
}: UseResumeAuditSweepMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeAuditSweepResponse,
    Error,
    ResumeAuditSweepVariables
  >({
    mutationFn: ({ auditId, zone_id }) =>
      resumeAuditSweepService({
        auditId,
        data: { zone_id },
        organizationId,
      }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Zone sweep resumed");
      queryClient.invalidateQueries({
        queryKey: ["faAuditZones", organizationId],
      });
    },
  });
};

export default useResumeAuditSweepMutation;
