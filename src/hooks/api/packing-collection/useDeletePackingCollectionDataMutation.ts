import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { deletePackingCollectionDataService } from "@/services/packing-collection/deletePackingCollectionDataService";
import { PackingCollectionDeleteResponse } from "@/types/packing-collection";

import { KEY_USE_GET_PACKING_COLLECTION_DATA } from "./useGetPackingCollectionDataQuery";

interface UseDeletePackingCollectionDataMutationParams {
  organizationId: string;
}

interface DeletePackingCollectionPayload {
  packingCollectionId: string;
}

const useDeletePackingCollectionDataMutation = ({
  organizationId,
}: UseDeletePackingCollectionDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<PackingCollectionDeleteResponse, Error, DeletePackingCollectionPayload>({
    mutationFn: ({ packingCollectionId }: DeletePackingCollectionPayload) =>
      deletePackingCollectionDataService({ organizationId, packingCollectionId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Packing collection deleted successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(organizationId),
      });
    },
  });
};

export default useDeletePackingCollectionDataMutation;