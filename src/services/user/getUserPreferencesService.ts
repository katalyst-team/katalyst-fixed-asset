import {
  GetUserPreferencesParams,
  GetUserPreferencesResponse,
  UpdateUserPreferencesParams,
  UpdateUserPreferencesResponse,
} from "@/types/user-preferences";

import fetcher, { ApiResponse } from "..";

export type {
  GetUserPreferencesParams,
  GetUserPreferencesResponse,
  UpdateUserPreferencesParams,
  UpdateUserPreferencesResponse,
};

export const getUserPreferencesService = async ({
  userId,
}: GetUserPreferencesParams): Promise<ApiResponse<GetUserPreferencesResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/users/${userId}/preferences`,
  });
};

export const updateUserPreferencesService = async ({
  userId,
  ...body
}: UpdateUserPreferencesParams): Promise<ApiResponse<UpdateUserPreferencesResponse>> => {
  return fetcher({
    data: body,
    method: "PATCH",
    url: `/v1/users/${userId}/preferences`,
  });
};
