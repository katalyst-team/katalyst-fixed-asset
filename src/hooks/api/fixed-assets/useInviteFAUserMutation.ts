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
    onSuccess: (response) => {
      if (response.data?.status === "already-member") {
        toast.info("That user is already a member of this organization");
      } else {
        toast.success("User invited successfully");
      }
      queryClient.invalidateQueries({
        queryKey: ["faUsers", organizationId],
      });
    },
  });
};

export default useInviteFAUserMutation;
