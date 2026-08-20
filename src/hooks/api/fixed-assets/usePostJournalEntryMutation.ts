import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  PostJournalEntryResponse,
  postJournalEntryService,
} from "@/services/fixed-assets/postJournalEntryService";

interface UsePostJournalEntryMutationParams {
  organizationId: string;
}

interface PostJournalEntryVariables {
  journalEntryId: string;
}

const usePostJournalEntryMutation = ({
  organizationId,
}: UsePostJournalEntryMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<PostJournalEntryResponse, Error, PostJournalEntryVariables>({
    mutationFn: ({ journalEntryId }) =>
      postJournalEntryService({ journalEntryId, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Journal entry posted");
      queryClient.invalidateQueries({ queryKey: ["faJournalEntries", organizationId] });
    },
  });
};

export default usePostJournalEntryMutation;
