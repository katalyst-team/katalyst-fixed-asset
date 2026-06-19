import { GetMeMenusResponse } from "@/types/menu";

import fetcher from "..";

/**
 * Fetches the sidebar menus for the currently authenticated user.
 * Returns only effectively ACTIVE menus as a tree (priority: AOR override → Role override → Org status).
 * Endpoint: GET /accounts/me/menus
 */
export const getMeMenusService = async (): Promise<GetMeMenusResponse> => {
  return fetcher({
    method: "GET",
    url: "/v1/accounts/me/menus",
  });
};
