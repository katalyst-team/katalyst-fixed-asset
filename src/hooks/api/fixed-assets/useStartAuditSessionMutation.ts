import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  StartAuditSessionResponse,
  startAuditSessionService,
} from "@/services/fixed-assets/startAuditSessionService";
import type { StartAuditSessionRequest } from "@/types/fixed-assets";

interface UseStartAuditSessionMutationParams {
  organizationId: string;
}

const useStartAuditSessionMutation = ({
  organizationId,
}: UseStartAuditSessionMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    StartAuditSessionResponse,
    Error,
    StartAuditSessionRequest | undefined
  >({
    mutationFn: (data) =>
      startAuditSessionService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (resp) => {
      toast.success(
        `Audit session started · ${resp?.data?.zone_count ?? 0} zones`,
      );
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "faAuditZones",
      });
    },
  });
};

export default useStartAuditSessionMutation;
