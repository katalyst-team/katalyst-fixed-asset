import fetcher, { ApiResponse } from "@/services";

export interface SignInParams {
  email: string;
  password: string;
}

export type SignInResponse = ApiResponse<{
  message: string;
  access_token: string;
  access_token_expired_at: string;
  refresh_token: string;
  refresh_token_expired_at: string;
}>;

export const signInService = (
  params: SignInParams
): Promise<SignInResponse> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/accounts/login`,
  });
};
