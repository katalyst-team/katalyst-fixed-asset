import { useQuery } from "@tanstack/react-query";

import {
  GetChatSessionsResponse,
  getChatSessionsService,
} from "@/services/ai-chat/getChatSessionsService";

export const KEY_USE_GET_CHAT_SESSIONS = (organizationId: string) => [
  "aiChatSessions",
  organizationId,
];

interface UseChatSessionsQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
}

const useChatSessionsQuery = ({
  enabled = true,
  limit = 20,
  organizationId,
}: UseChatSessionsQueryParams) => {
  return useQuery<GetChatSessionsResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getChatSessionsService({ limit, organizationId }),
    queryKey: [...KEY_USE_GET_CHAT_SESSIONS(organizationId), limit],
    staleTime: 0,
  });
};

export default useChatSessionsQuery;
