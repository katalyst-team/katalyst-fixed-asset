import { useQuery } from "@tanstack/react-query";

import {
  GetChatSessionMessagesResponse,
  getChatSessionMessagesService,
} from "@/services/ai-chat/getChatSessionMessagesService";

export const KEY_USE_GET_CHAT_SESSION_MESSAGES = (
  organizationId: string,
  sessionId: string,
) => ["aiChatSessionMessages", organizationId, sessionId];

interface UseChatSessionMessagesQueryParams {
  enabled?: boolean;
  organizationId: string;
  sessionId?: string | null;
}

const useChatSessionMessagesQuery = ({
  enabled = true,
  organizationId,
  sessionId,
}: UseChatSessionMessagesQueryParams) => {
  return useQuery<GetChatSessionMessagesResponse, Error>({
    enabled: Boolean(organizationId) && Boolean(sessionId) && enabled,
    queryFn: () =>
      getChatSessionMessagesService({
        organizationId,
        sessionId: sessionId as string,
      }),
    queryKey: KEY_USE_GET_CHAT_SESSION_MESSAGES(organizationId, sessionId ?? ""),
    staleTime: 0,
  });
};

export default useChatSessionMessagesQuery;
