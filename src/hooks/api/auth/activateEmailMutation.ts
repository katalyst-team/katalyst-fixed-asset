import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import {
  ActivateEmailParams,
  ActivateEmailResponse,
  activateEmailService,
} from "@/services/auth/activateEmailService";

export type IActivateEmailMutation = UseMutationResult<
  ActivateEmailResponse,
  Error,
  ActivateEmailParams,
  unknown
>;

export const KEY_ACTIVATE_EMAIL = () => ["activate-email"];

export function useActivateEmailMutation(): IActivateEmailMutation {
  return useMutation({
    mutationFn: activateEmailService,
    mutationKey: KEY_ACTIVATE_EMAIL(),
  });
}
