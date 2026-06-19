import fetcher, { ApiResponse } from "@/services";

export interface ActivateEmailParams {
  email: string;
  otp: string;
}

export type ActivateEmailResponse = ApiResponse<{ message: string }>;

export const activateEmailService = (
  params: ActivateEmailParams
): Promise<ActivateEmailResponse> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/accounts/activate`,
  });
};
