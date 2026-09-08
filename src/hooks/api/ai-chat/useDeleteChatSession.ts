import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { KEY_USE_GET_CHAT_SESSIONS } from "@/hooks/api/ai-chat/useChatSessionsQuery";
import { toastError } from "@/services";
import { deleteChatSessionService } from "@/services/ai-chat/deleteChatSessionService";

interface UseDeleteChatSessionParams {
  organizationId: string;
  onSuccess?: () => void;
}

const useDeleteChatSession = ({
  onSuccess,
  organizationId,
}: UseDeleteChatSessionParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      deleteChatSessionService({ organizationId, sessionId }),
    onError: (error: Error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Chat session deleted");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_CHAT_SESSIONS(organizationId),
      });
      onSuccess?.();
    },
  });
};

export default useDeleteChatSession;
