import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { createPackingCollectionDataService } from "@/services/packing-collection/createPackingCollectionDataService";
import { CreatePackingCollectionPayload, PackingCollectionCreateResponse } from "@/types/packing-collection";

import { KEY_USE_GET_PACKING_COLLECTION_DATA } from "./useGetPackingCollectionDataQuery";

interface UseCreatePackingCollectionDataMutationParams {
  organizationId: string;
}

const useCreatePackingCollectionDataMutation = ({
  organizationId,
}: UseCreatePackingCollectionDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<PackingCollectionCreateResponse, Error, CreatePackingCollectionPayload>({
    mutationFn: (payload: CreatePackingCollectionPayload) =>
      createPackingCollectionDataService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Packing collection created successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(organizationId),
      });
    },
  });
};

export default useCreatePackingCollectionDataMutation;