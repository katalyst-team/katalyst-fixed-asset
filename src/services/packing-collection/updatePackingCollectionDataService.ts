import { PackingCollectionCreateResponse, UpdatePackingCollectionPayload } from "@/types/packing-collection";

import fetcher from "..";

interface UpdatePackingCollectionDataParams {
  organizationId: string;
  packingCollectionId: string;
  payload: UpdatePackingCollectionPayload;
}

export const updatePackingCollectionDataService = async ({
  organizationId,
  packingCollectionId,
  payload,
}: UpdatePackingCollectionDataParams): Promise<PackingCollectionCreateResponse> => {
  const url = `/v1/organizations/${organizationId}/packing-collections/${packingCollectionId}`;

  return fetcher({
    data: payload,
    method: "PATCH",
    url,
  });
};