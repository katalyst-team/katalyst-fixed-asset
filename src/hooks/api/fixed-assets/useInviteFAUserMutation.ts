import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  InviteFAUserResponse,
  inviteFAUserService,
} from "@/services/fixed-assets/inviteFAUserService";
import type { InviteFAUserRequest } from "@/types/fixed-assets";

interface UseInviteFAUserMutationParams {
  organizationId: string;
}

const useInviteFAUserMutation = ({
  organizationId,
}: UseInviteFAUserMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<InviteFAUserResponse, Error, InviteFAUserRequest>({
    mutationFn: (data) => inviteFAUserService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("User invited successfully");
      queryClient.invalidateQueries({
        queryKey: ["faUsers", organizationId],
      });
    },
  });
};

export default useInviteFAUserMutation;
