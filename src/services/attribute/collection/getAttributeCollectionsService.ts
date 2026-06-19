import { AttributeCollectionListResponse } from '@/types/attributeCollection';

import fetcher from '../..';

export interface GetAttributeCollectionsResponse {
  data: AttributeCollectionListResponse;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

interface GetAttributeCollectionsParams {
  organizationId: string;
  store_id?: string;
}

export const getAttributeCollectionsService = async ({
  organizationId,
  store_id,
}: GetAttributeCollectionsParams): Promise<GetAttributeCollectionsResponse> => {
  const params = new URLSearchParams();
  if (store_id) params.append("store_id", store_id);
  const query = params.toString();
  const url = `/v1/organizations/${organizationId}/attribute-collections${query ? `?${query}` : ""}`;
  return fetcher({
    method: 'GET',
    url,
  });
};
