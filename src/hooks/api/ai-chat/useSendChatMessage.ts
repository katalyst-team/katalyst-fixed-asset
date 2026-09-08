import { useMutation, useQueryClient } from "@tanstack/react-query";

import { KEY_USE_GET_CHAT_SESSIONS } from "@/hooks/api/ai-chat/useChatSessionsQuery";
import { toastError } from "@/services";
import {
  SendChatMessageResponse,
  sendChatMessageService,
} from "@/services/ai-chat/sendChatMessageService";

interface UseSendChatMessageParams {
  organizationId: string;
  onSuccess?: (data: SendChatMessageResponse) => void;
}

const useSendChatMessage = ({
  onSuccess,
  organizationId,
}: UseSendChatMessageParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { message: string; session_id?: string; store_id?: string }) =>
      sendChatMessageService({ body, organizationId }),
    onError: (error: Error) => {
      toastError(error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_CHAT_SESSIONS(organizationId),
      });
    },
  });
};

export default useSendChatMessage;
