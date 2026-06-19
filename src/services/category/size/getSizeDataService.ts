import fetcher, { ApiResponse } from "@/services";
import { SizeItemType } from "@/types/size";

interface GetSizeDataParams {
  organizationId: string;
}

export type GetSizeDataResponse = ApiResponse<{ sizes: SizeItemType[] }>;

export const getSizeDataService = async ({
  organizationId,
}: GetSizeDataParams): Promise<GetSizeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/sizes`;
  return fetcher({
    method: "GET",

    url,
  });
};
