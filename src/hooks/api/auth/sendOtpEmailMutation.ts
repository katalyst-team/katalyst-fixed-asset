import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import {
  SendOtpEmailParams,
  SendOtpEmailResponse,
  sendOtpEmailService,
} from "@/services/auth/sendOtpEmailService";

export type ISendOtpEmailMutation = UseMutationResult<
  SendOtpEmailResponse,
  Error,
  SendOtpEmailParams,
  unknown
>;

export const KEY_SEND_OTP_EMAIL = () => ["send-otp-email"];

export function useSendOtpEmailMutation(): ISendOtpEmailMutation {
  return useMutation({
    mutationFn: sendOtpEmailService,
    mutationKey: KEY_SEND_OTP_EMAIL(),
  });
}
