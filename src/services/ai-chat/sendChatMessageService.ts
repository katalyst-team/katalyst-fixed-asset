import fetcher, { ApiResponse } from "..";

export interface ChatToolUsage {
  name: string;
}

export interface SendChatMessageResponseData {
  session_id: string;
  answer: string;
  tools_used: ChatToolUsage[];
}

export type SendChatMessageResponse = ApiResponse<SendChatMessageResponseData>;

interface SendChatMessageParams {
  organizationId: string;
  body: {
    message: string;
    session_id?: string;
    store_id?: string;
  };
}

export const sendChatMessageService = async ({
  body,
  organizationId,
}: SendChatMessageParams): Promise<SendChatMessageResponse> => {
  return fetcher({
    data: body,
    method: "POST",
    url: `/v1/organizations/${organizationId}/ai/chat`,
  });
};
