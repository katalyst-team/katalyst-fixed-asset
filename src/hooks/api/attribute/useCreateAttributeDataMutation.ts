import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CreateAttributeDataResponse,
  createAttributeDataService,
} from "@/services/attribute/createAttributeDataService";
import { CreateAttributeRequest } from "@/types/attribute";


interface UseCreateAttributeDataMutationParams {
  organizationId: string;
}

const useCreateAttributeDataMutation = ({
  organizationId,
}: UseCreateAttributeDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAttributeDataResponse,
    Error,
    CreateAttributeRequest,
    unknown
  >({
    mutationFn: (data: CreateAttributeRequest) => {
      return createAttributeDataService({
        data,
        organizationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attributeData", organizationId],
      });
    },
  });
};

export default useCreateAttributeDataMutation;
