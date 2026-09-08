import fetcher, { ApiResponse } from "..";

export interface ChatMessageItem {
  id: string;
  role: "ASSISTANT" | "TOOL" | "USER";
  content: string;
  tool_name?: string;
  created_at: string;
}

export type GetChatSessionMessagesResponse = ApiResponse<ChatMessageItem[]>;

interface GetChatSessionMessagesParams {
  organizationId: string;
  sessionId: string;
}

export const getChatSessionMessagesService = async ({
  organizationId,
  sessionId,
}: GetChatSessionMessagesParams): Promise<GetChatSessionMessagesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/ai/chat/sessions/${sessionId}`,
  });
};
