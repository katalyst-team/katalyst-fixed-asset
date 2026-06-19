import fetcher from "..";

export interface ChangePasswordRequest {
  confirm_new_password: string;
  current_password: string;
  new_password: string;
}

export const changePasswordService = async (data: ChangePasswordRequest) => {
  return fetcher({
    data,
    method: "POST",
    url: "/v1/accounts/me/change-password",
  });
};
