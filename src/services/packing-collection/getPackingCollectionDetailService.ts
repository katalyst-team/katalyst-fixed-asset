import { PackingCollectionDetailResponse } from "@/types/packing-collection";

import fetcher from "..";

interface GetPackingCollectionDetailParams {
  organizationId: string;
  packingCollectionId: string;
}

export const getPackingCollectionDetailService = async ({
  organizationId,
  packingCollectionId,
}: GetPackingCollectionDetailParams): Promise<PackingCollectionDetailResponse> => {
  const url = `/v1/organizations/${organizationId}/packing-collections/${packingCollectionId}`;

  return fetcher({
    method: "GET",
    url,
  });
};