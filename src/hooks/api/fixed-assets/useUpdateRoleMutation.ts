import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  UpdateRoleResponse,
  updateRoleService,
} from "@/services/fixed-assets/updateRoleService";
import type { UpdateRoleRequest } from "@/types/fixed-assets";

interface UseUpdateRoleMutationParams {
  organizationId: string;
}

interface UpdateRoleVariables {
  data: UpdateRoleRequest;
  roleId: string;
}

const useUpdateRoleMutation = ({
  organizationId,
}: UseUpdateRoleMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateRoleResponse, Error, UpdateRoleVariables>({
    mutationFn: ({ data, roleId }) =>
      updateRoleService({ data, organizationId, roleId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({
        queryKey: ["faRoles"],
      });
    },
  });
};

export default useUpdateRoleMutation;
