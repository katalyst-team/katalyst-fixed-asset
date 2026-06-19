import { useMutation } from "@tanstack/react-query";

import { resetPasswordOTPService } from "@/services/auth/resetPasswordOTPService";
import { ResetPasswordOTPRequest } from "@/types/auth";

export const useResetPasswordOTPMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordOTPRequest) =>
      resetPasswordOTPService(data),
  });
};
