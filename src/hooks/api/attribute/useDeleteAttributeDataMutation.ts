import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  DeleteAttributeDataResponse,
  deleteAttributeDataService,
} from '@/services/attribute/deleteAttributeDataService';


interface UseDeleteAttributeDataMutationParams {
  attributeId: string;
  organizationId: string;
}

const useDeleteAttributeDataMutation = ({
  organizationId,
  attributeId,
}: UseDeleteAttributeDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAttributeDataResponse,
    Error,
    void,
    unknown
  >({
    mutationFn: () =>
      deleteAttributeDataService({
        attributeId,
        organizationId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attributeData", organizationId],
      });
    },
  });
};

export default useDeleteAttributeDataMutation;
