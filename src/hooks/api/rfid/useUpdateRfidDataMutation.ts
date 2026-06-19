import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { updateRfidDataService } from "@/services/rfid/updateRfidDataService";
import { RfidCreateResponse, UpdateRfidPayload } from "@/types/rfid";

import { KEY_USE_GET_RFID_DATA } from "./useGetRfidDataQuery";

interface UseUpdateRfidDataMutationParams {
  organizationId: string;
}

const useUpdateRfidDataMutation = ({
  organizationId,
}: UseUpdateRfidDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<RfidCreateResponse, Error, UpdateRfidPayload>({
    mutationFn: (payload: UpdateRfidPayload) =>
      updateRfidDataService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("RFID updated successfully");
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_RFID_DATA(organizationId, {}),
      });
    },
  });
};

export default useUpdateRfidDataMutation;
