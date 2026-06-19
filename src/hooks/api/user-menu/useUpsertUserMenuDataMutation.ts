import { useMutation, useQueryClient } from "@tanstack/react-query";

import { upsertUserMenuDataService } from "@/services/user-menu/upsertUserMenuDataService";
import { UpsertUserMenuParams } from "@/types/user-menu";

import { KEY_USE_GET_ALL_USER_MENU_DATA } from "./useGetAllUserMenuDataQuery";
import { KEY_USE_GET_USER_MENU_DATA } from "./useGetUserMenuDataQuery";

interface MutationProps {
  onSuccess?: () => void;
}

interface MutationParams {
  organizationId: string;
  accountOrganizationId: string;
  params: UpsertUserMenuParams;
}

const useUpsertUserMenuDataMutation = (props: MutationProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, accountOrganizationId, params }: MutationParams) =>
      upsertUserMenuDataService({ accountOrganizationId, organizationId, params }),
    mutationKey: ["upsertUserMenu"],
    onSuccess: (_, { organizationId, accountOrganizationId }) => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_USER_MENU_DATA(organizationId, accountOrganizationId),
      });
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_ALL_USER_MENU_DATA(organizationId),
      });
      props.onSuccess?.();
    },
  });
};

export default useUpsertUserMenuDataMutation;
