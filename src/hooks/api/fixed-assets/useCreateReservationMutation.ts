import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  CreateReservationResponse,
  createReservationService,
} from "@/services/fixed-assets/createReservationService";
import type { CreateReservationRequest } from "@/types/fixed-assets";

interface UseCreateReservationMutationParams {
  organizationId: string;
}

const useCreateReservationMutation = ({
  organizationId,
}: UseCreateReservationMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation<CreateReservationResponse, Error, CreateReservationRequest>({
    mutationFn: (data) => createReservationService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Reservation created");
      queryClient.invalidateQueries({
        queryKey: ["faReservations", organizationId],
      });
    },
  });
};

export default useCreateReservationMutation;
