import fetcher, { ApiResponse } from "@/services";

export interface SendOtpEmailParams {
  email: string;
}

export type SendOtpEmailResponse = ApiResponse<{ message: string }>;

export const sendOtpEmailService = (
  params: SendOtpEmailParams
): Promise<SendOtpEmailResponse> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/accounts/send-otp`,
  });
};
