import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import {
  SignInParams,
  SignInResponse,
  signInService,
} from "@/services/auth/signInService";

export type ISignInMutation = UseMutationResult<
  SignInResponse,
  Error,
  SignInParams,
  unknown
>;

export const KEY_SIGN_IN = () => ["sign-in"];

export function useSignInMutation(): ISignInMutation {
  return useMutation({
    mutationFn: signInService,
    mutationKey: KEY_SIGN_IN(),
  });
}
