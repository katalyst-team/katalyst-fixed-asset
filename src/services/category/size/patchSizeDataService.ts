import fetcher, { ApiResponse } from "../..";

export interface PatchSizeDataParams {
  id: string;
  name: string;
  organization_id: string;
}

export type PatchSizeDataResponse = ApiResponse<{ id: string }>;

export const patchSizeDataService = async (
  params: PatchSizeDataParams
): Promise<PatchSizeDataResponse> => {
  const url = `/v1/organizations/${params.organization_id}/sizes/${params.id}`;
  return fetcher({
    data: {
      name: params.name,
    },
    method: "PATCH",
    url,
  });
};
