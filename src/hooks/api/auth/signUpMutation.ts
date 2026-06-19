import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import {
  SignUpParams,
  SignUpResponses,
  signUpService,
} from "@/services/auth/signUpService";

export type ISignUpMutation = UseMutationResult<
  SignUpResponses,
  Error,
  SignUpParams,
  unknown
>;
export const KEY_SIGN_UP = () => ["sign-up"];

export function useSignUpMutation(): ISignUpMutation {
  const signUp = useMutation({
    mutationFn: signUpService,
    mutationKey: KEY_SIGN_UP(),
  });

  return signUp;
}
