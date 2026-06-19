import { useMutation } from "@tanstack/react-query";

import {
  UpdateProfileRequest,
  updateProfileService,
} from "@/services/auth/updateProfileService";

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileService(data),
  });
};
