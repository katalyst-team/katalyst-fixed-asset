import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formatIDR } from "@/modules/dashboard/fixed-assets";
import { toastError } from "@/services";
import {
  RunDepreciationResponse,
  runDepreciationService,
} from "@/services/fixed-assets/runDepreciationService";

interface UseRunDepreciationMutationParams {
  organizationId: string;
}

const useRunDepreciationMutation = ({
  organizationId,
}: UseRunDepreciationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<RunDepreciationResponse, Error>({
    mutationFn: () => runDepreciationService({ organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (resp) => {
      const posted = resp?.data?.posted_count ?? 0;
      if (posted > 0) {
        toast.success(
          `Depreciation posted: ${posted} schedules (${formatIDR(resp?.data?.total_depreciation ?? 0)})`,
        );
      } else {
        toast.info("No unposted depreciation schedules for this year");
      }
      queryClient.invalidateQueries({ queryKey: ["faDepreciation", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["faJournalEntries", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["faDashboard", organizationId] });
    },
  });
};

export default useRunDepreciationMutation;
