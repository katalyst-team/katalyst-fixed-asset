import fetcher, { ApiResponse } from "@/services";

export interface SignUpParams {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  organization_name: string;
}

export type SignUpResponses = ApiResponse<{
  message: string;
  access_token: string;
  access_token_expired_at: string;
  refresh_token: string;
  refresh_token_expired_at: string;
}>;

export const signUpService = (
  params: SignUpParams
): Promise<SignUpResponses> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/accounts/register`,
  });
};
