import fetcher, { ApiResponse } from "@/services";

export interface SignUpParams {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  organization_name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SignUpResponses extends ApiResponse<{ message: string }> {}

export const signUpService = (
  params: SignUpParams
): Promise<SignUpResponses> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/accounts/register`,
  });
};
