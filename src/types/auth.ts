export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordOTPRequest {
  email: string;
  new_password: string;
  otp: string;
}
