import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  PostApiKeyDataResponse,
  postApiKeyDataService,
} from "@/services/api-key/createApiKeyDataService";
import { PostApiKeyDataParams } from "@/types/api-key";

export type ICreateApiKeyMutation = UseMutationResult<
  PostApiKeyDataResponse,
  Error,
  PostApiKeyDataParams,
  unknown
>;

export const KEY_CREATE_API_KEY = () => ["createApiKey"];

export function useCreateApiKeyDataMutation(): ICreateApiKeyMutation {
  return useMutation({
    mutationFn: postApiKeyDataService,
    mutationKey: KEY_CREATE_API_KEY(),
  });
}

export default useCreateApiKeyDataMutation;
