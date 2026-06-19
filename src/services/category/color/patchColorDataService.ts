import fetcher, { ApiResponse } from "../..";

export interface PatchColorDataParams {
  name: string;
  organization_id: string;
  color_id: string;
}

export type PatchColorDataResponse = ApiResponse<{ id: string }>;

export const patchColorDataService = async (
  params: PatchColorDataParams
): Promise<PatchColorDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/colors/${params.color_id}`;
  return fetcher({
    data: { name: params.name },
    method: "PATCH",
    url,
  });
};
