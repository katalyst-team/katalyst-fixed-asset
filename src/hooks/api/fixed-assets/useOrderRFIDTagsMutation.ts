import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  OrderRFIDTagsResponse,
  orderRFIDTagsService,
} from "@/services/fixed-assets/orderRFIDTagsService";
import type { OrderRFIDTagsRequest } from "@/types/fixed-assets";

interface UseOrderRFIDTagsMutationParams {
  organizationId: string;
}

const useOrderRFIDTagsMutation = ({
  organizationId,
}: UseOrderRFIDTagsMutationParams) => {
  return useMutation<OrderRFIDTagsResponse, Error, OrderRFIDTagsRequest>({
    mutationFn: (data) => orderRFIDTagsService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Tag order placed successfully");
    },
  });
};

export default useOrderRFIDTagsMutation;
