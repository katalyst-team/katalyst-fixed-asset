import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { createRfidDataService } from "@/services/rfid/createRfidDataService";
import { CreateRfidPayload, RfidCreateResponse } from "@/types/rfid";

interface UseCreateRfidDataMutationParams {
  organizationId: string;
}

const useCreateRfidDataMutation = ({
  organizationId,
}: UseCreateRfidDataMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<RfidCreateResponse, Error, CreateRfidPayload>({
    mutationFn: (payload: CreateRfidPayload) =>
      createRfidDataService({ organizationId, payload }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("RFID created successfully");
      queryClient.invalidateQueries({
        queryKey: ["rfidData", organizationId],
      });
    },
  });
};

export default useCreateRfidDataMutation;
