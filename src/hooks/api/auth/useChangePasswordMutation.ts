import { useMutation } from "@tanstack/react-query";

import {
  ChangePasswordRequest,
  changePasswordService,
} from "@/services/auth/changePasswordService";

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordService(data),
  });
};
