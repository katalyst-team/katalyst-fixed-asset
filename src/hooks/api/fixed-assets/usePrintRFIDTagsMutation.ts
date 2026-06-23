import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import {
  PrintRFIDTagsResponse,
  printRFIDTagsService,
} from "@/services/fixed-assets/printRFIDTagsService";
import type { PrintRFIDTagsRequest } from "@/types/fixed-assets";

interface UsePrintRFIDTagsMutationParams {
  organizationId: string;
}

const usePrintRFIDTagsMutation = ({
  organizationId,
}: UsePrintRFIDTagsMutationParams) => {
  return useMutation<PrintRFIDTagsResponse, Error, PrintRFIDTagsRequest>({
    mutationFn: (data) => printRFIDTagsService({ data, organizationId }),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: () => {
      toast.success("Tags sent to print queue");
    },
  });
};

export default usePrintRFIDTagsMutation;
