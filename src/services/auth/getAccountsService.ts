import fetcher, { ApiResponse } from "@/services";

export interface AccountPermission {
  action_key: string;
  display_name: string;
  id: string;
  module_key: string;
  name: string;
  scope_level: string;
}

export interface AccountRole {
  display_name: string;
  id: string;
  is_system: boolean;
  name: string;
}

export interface AccountStore {
  id: string;
  name: string;
}

export type GetAccountsResponse = ApiResponse<{
  ext_id: string;
  first_name: string;
  last_name: string;
  message: string;
  permissions: AccountPermission[];
  role: AccountRole;
  stores: AccountStore[];
}>;

export const getAccountsService = (): Promise<GetAccountsResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/accounts/me`,
  });
};
