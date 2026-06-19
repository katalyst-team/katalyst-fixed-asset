import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastError } from "@/services";
import { registerItemsService } from "@/services/item/registerItemsService";
import type {
  RegisterItemsApiResponse,
  RegisterItemsServiceParams,
} from "@/types/rstCutting";

export const USE_REGISTER_ITEMS_MUTATION_KEY = () => ["registerItems"];

interface UseRegisterItemsMutationProps {
  onSuccess?: (data: RegisterItemsApiResponse) => void;
}

const useRegisterItemsMutation = ({
  onSuccess,
}: UseRegisterItemsMutationProps = {}): UseMutationResult<
  RegisterItemsApiResponse,
  Error,
  RegisterItemsServiceParams,
  unknown
> => {
  return useMutation({
    mutationFn: registerItemsService,
    mutationKey: USE_REGISTER_ITEMS_MUTATION_KEY(),
    onError: (error) => {
      toastError(error);
    },
    onSuccess: (data) => {
      toast.success("Items registered successfully");
      onSuccess?.(data);
    },
  });
};

export default useRegisterItemsMutation;
