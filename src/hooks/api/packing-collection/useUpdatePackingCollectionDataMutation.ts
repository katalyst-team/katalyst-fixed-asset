import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { updatePackingCollectionDataService } from "@/services/packing-collection/updatePackingCollectionDataService";
import { PackingCollectionCreateResponse, UpdatePackingCollectionPayload } from "@/types/packing-collection";

import { KEY_USE_GET_PACKING_COLLECTION_DATA } from "./useGetPackingCollectionDataQuery";
import { KEY_USE_GET_PACKING_COLLECTION_DETAIL } from "./useGetPackingCollectionDetailQuery";

interface UseUpdatePackingCollectionDataMutationParams {
  organizationId: string;
  packingCollectionId: string;
}

const useUpdatePackingCollectionDataMutation = ({
  organizationId,
  packingCollectionId,
}: UseUpdatePackingCollectionDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<PackingCollectionCreateResponse, Error, UpdatePackingCollectionPayload>({
    mutationFn: (payload: UpdatePackingCollectionPayload) =>
      updatePackingCollectionDataService({ organizationId, packingCollectionId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Packing collection updated successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_PACKING_COLLECTION_DETAIL(organizationId, packingCollectionId),
      });
    },
  });
};

export default useUpdatePackingCollectionDataMutation;