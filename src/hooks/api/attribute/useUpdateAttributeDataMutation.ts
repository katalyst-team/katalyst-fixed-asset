import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  UpdateAttributeDataResponse,
  updateAttributeDataService,
} from '@/services/attribute/updateAttributeDataService';
import { UpdateAttributeRequest } from '@/types/attribute';


interface UseUpdateAttributeDataMutationParams {
  attributeId: string;
  organizationId: string;
}

const useUpdateAttributeDataMutation = ({
  organizationId,
  attributeId,
}: UseUpdateAttributeDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAttributeDataResponse,
    Error,
    UpdateAttributeRequest,
    unknown
  >({
    mutationFn: (data: UpdateAttributeRequest) =>
      updateAttributeDataService({
        attributeId,
        data,
        organizationId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attributeData", organizationId],
      });
    },
  });
};

export default useUpdateAttributeDataMutation;
