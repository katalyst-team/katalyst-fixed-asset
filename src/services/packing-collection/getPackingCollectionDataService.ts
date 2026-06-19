import { PackingCollectionFilterOptions, PackingCollectionListResponse } from "@/types/packing-collection";

import fetcher from "..";

interface GetPackingCollectionDataParams {
  organizationId: string;
  filters?: PackingCollectionFilterOptions;
}

export const getPackingCollectionDataService = async ({
  organizationId,
  filters,
}: GetPackingCollectionDataParams): Promise<PackingCollectionListResponse> => {
  const url = `/v1/organizations/${organizationId}/packing-collections`;

  const params = new URLSearchParams();

  if (filters?.query) {
    params.append("query", filters.query);
  }
  if (filters?.cursor) {
    params.append("cursor", filters.cursor);
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }
  if (filters?.store_id) {
    params.append("store_id", filters.store_id);
  }

  const queryString = params.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return fetcher({
    method: "GET",
    url: fullUrl,
  });
};