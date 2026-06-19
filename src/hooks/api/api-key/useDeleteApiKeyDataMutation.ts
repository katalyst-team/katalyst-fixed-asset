import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  DeleteApiKeyDataResponse,
  deleteApiKeyDataService,
} from "@/services/api-key/deleteApiKeyDataService";
import { DeleteApiKeyDataParams } from "@/types/api-key";

export type IDeleteApiKeyMutation = UseMutationResult<
  DeleteApiKeyDataResponse,
  Error,
  DeleteApiKeyDataParams,
  unknown
>;

export const KEY_DELETE_API_KEY = () => ["deleteApiKey"];

export function useDeleteApiKeyDataMutation(): IDeleteApiKeyMutation {
  return useMutation({
    mutationFn: deleteApiKeyDataService,
    mutationKey: KEY_DELETE_API_KEY(),
  });
}

export default useDeleteApiKeyDataMutation;
