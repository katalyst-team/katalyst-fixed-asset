import { ResetPasswordRequest } from "@/types/auth";

import fetcher from "..";

export const resetPasswordService = async (data: ResetPasswordRequest) => {
  return fetcher({
    data,
    method: "POST",
    url: "/v1/accounts/reset-password-otp",
  });
};
