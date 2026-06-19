import { CreatePackingCollectionPayload, PackingCollectionCreateResponse } from "@/types/packing-collection";

import fetcher from "..";

interface CreatePackingCollectionDataParams {
  organizationId: string;
  payload: CreatePackingCollectionPayload;
}

export const createPackingCollectionDataService = async ({
  organizationId,
  payload,
}: CreatePackingCollectionDataParams): Promise<PackingCollectionCreateResponse> => {
  const url = `/v1/organizations/${organizationId}/packing-collections`;

  return fetcher({
    data: payload,
    method: "POST",
    url,
  });
};