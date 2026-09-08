import fetcher, { ApiResponse } from "..";

export interface ChatSessionItem {
  id: string;
  title: string;
  last_message_at: string;
  created_at: string;
}

export type GetChatSessionsResponse = ApiResponse<ChatSessionItem[]>;

interface GetChatSessionsParams {
  organizationId: string;
  cursor?: string;
  limit?: number;
}

export const getChatSessionsService = async ({
  cursor,
  limit,
  organizationId,
}: GetChatSessionsParams): Promise<GetChatSessionsResponse> => {
  const params = new URLSearchParams();

  if (limit) {
    params.append("limit", String(limit));
  }

  if (cursor) {
    params.append("cursor", cursor);
  }

  return fetcher({
    method: "GET",
    params,
    url: `/v1/organizations/${organizationId}/ai/chat/sessions`,
  });
};
