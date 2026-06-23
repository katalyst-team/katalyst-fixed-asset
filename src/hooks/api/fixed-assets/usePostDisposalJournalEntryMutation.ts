import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  PostDisposalJournalEntryResponse,
  postDisposalJournalEntryService,
} from "@/services/fixed-assets/postDisposalJournalEntryService";

interface UsePostDisposalJournalEntryMutationParams {
  organizationId: string;
}

const usePostDisposalJournalEntryMutation = ({
  organizationId,
}: UsePostDisposalJournalEntryMutationParams) => {
  return useMutation<
    PostDisposalJournalEntryResponse,
    Error,
    { disposalId: string }
  >({
    mutationFn: ({ disposalId }) =>
      postDisposalJournalEntryService({ disposalId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Journal entry posted to GL");
    },
  });
};

export default usePostDisposalJournalEntryMutation;
