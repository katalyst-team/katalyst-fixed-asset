import { ResetPasswordOTPRequest } from "@/types/auth";

import fetcher from "..";

export const resetPasswordOTPService = async (
  data: ResetPasswordOTPRequest
) => {
  return fetcher({
    data,
    method: "POST",
    url: "/v1/accounts/reset-password",
  });
};
