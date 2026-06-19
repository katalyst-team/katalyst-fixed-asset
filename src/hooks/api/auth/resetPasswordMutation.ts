import { useMutation } from "@tanstack/react-query";

import { resetPasswordService } from "@/services/auth/resetPasswordService";
import { ResetPasswordRequest } from "@/types/auth";

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordService(data),
  });
};
