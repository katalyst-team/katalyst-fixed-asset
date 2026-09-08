import fetcher, { ApiResponse } from "..";

export type DeleteChatSessionResponse = ApiResponse<null>;

interface DeleteChatSessionParams {
  organizationId: string;
  sessionId: string;
}

export const deleteChatSessionService = async ({
  organizationId,
  sessionId,
}: DeleteChatSessionParams): Promise<DeleteChatSessionResponse> => {
  return fetcher({
    method: "DELETE",
    url: `/v1/organizations/${organizationId}/ai/chat/sessions/${sessionId}`,
  });
};
