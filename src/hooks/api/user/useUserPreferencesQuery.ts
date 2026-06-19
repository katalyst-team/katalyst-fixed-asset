import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/services";
import {
  GetUserPreferencesParams,
  GetUserPreferencesResponse,
  getUserPreferencesService,
  UpdateUserPreferencesParams,
  UpdateUserPreferencesResponse,
  updateUserPreferencesService,
} from "@/services/user/getUserPreferencesService";

export const KEY_USE_GET_USER_PREFERENCES = (userId: string) => ["userPreferences", userId];

const useGetUserPreferencesQuery = ({ userId }: GetUserPreferencesParams) => {
  return useQuery<ApiResponse<GetUserPreferencesResponse>, Error>({
    enabled: Boolean(userId),
    queryFn: () => getUserPreferencesService({ userId }),
    queryKey: KEY_USE_GET_USER_PREFERENCES(userId),
    staleTime: 300000,
  });
};

export const USE_UPDATE_USER_PREFERENCES_MUTATION_KEY = () => ["updateUserPreferences"];

const useUpdateUserPreferencesMutation = (): UseMutationResult<
  ApiResponse<UpdateUserPreferencesResponse>,
  Error,
  UpdateUserPreferencesParams,
  unknown
> => {
  return useMutation({
    mutationFn: updateUserPreferencesService,
    mutationKey: USE_UPDATE_USER_PREFERENCES_MUTATION_KEY(),
  });
};

export { useGetUserPreferencesQuery, useUpdateUserPreferencesMutation };
