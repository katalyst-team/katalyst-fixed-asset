import { PackingCollectionDeleteResponse } from "@/types/packing-collection";

import fetcher from "..";

interface DeletePackingCollectionDataParams {
  organizationId: string;
  packingCollectionId: string;
}

export const deletePackingCollectionDataService = async ({
  organizationId,
  packingCollectionId,
}: DeletePackingCollectionDataParams): Promise<PackingCollectionDeleteResponse> => {
  const url = `/v1/organizations/${organizationId}/packing-collections/${packingCollectionId}`;

  return fetcher({
    method: "DELETE",
    url,
  });
};