import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { deleteRfidDataService } from "@/services/rfid/deleteRfidDataService";
import { DeleteRfidPayload, RfidDeleteResponse } from "@/types/rfid";

import { KEY_USE_GET_RFID_DATA } from "./useGetRfidDataQuery";

interface UseDeleteRfidDataMutationParams {
  organizationId: string;
}

const useDeleteRfidDataMutation = ({
  organizationId,
}: UseDeleteRfidDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<RfidDeleteResponse, Error, DeleteRfidPayload>({
    mutationFn: (payload: DeleteRfidPayload) =>
      deleteRfidDataService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("RFID deleted successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_RFID_DATA(organizationId, {}),
      });
    },
  });
};

export default useDeleteRfidDataMutation;
