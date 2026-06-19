import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PatchApiKeyDataResponse,
  patchApiKeyDataService,
} from "@/services/api-key/patchApiKeyDataService";
import { PatchApiKeyDataParams } from "@/types/api-key";

export type IEditApiKeyMutation = UseMutationResult<
  PatchApiKeyDataResponse,
  Error,
  PatchApiKeyDataParams,
  unknown
>;

export const KEY_EDIT_API_KEY = () => ["editApiKey"];

export function useEditApiKeyDataMutation(): IEditApiKeyMutation {
  return useMutation({
    mutationFn: patchApiKeyDataService,
    mutationKey: KEY_EDIT_API_KEY(),
  });
}

export default useEditApiKeyDataMutation;
