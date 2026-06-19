import fetcher from "..";

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
}

export const updateProfileService = async (data: UpdateProfileRequest) => {
  return fetcher({
    data,
    method: "PATCH",
    url: "/v1/accounts/me/profile",
  });
};
