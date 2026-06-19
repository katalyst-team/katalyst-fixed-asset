import { AttributeCollectionResponse } from '@/types/attributeCollection';

import fetcher from '../..';

export interface DeleteAttributeCollectionResponse {
  data: AttributeCollectionResponse;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

interface DeleteAttributeCollectionParams {
  organizationId: string;
  attributeCollectionId: string;
}

export const deleteAttributeCollectionService = async ({
  organizationId,
  attributeCollectionId,
}: DeleteAttributeCollectionParams): Promise<DeleteAttributeCollectionResponse> => {
  const url = `/v1/organizations/${organizationId}/attribute-collections/${attributeCollectionId}`;
  return fetcher({
    method: 'DELETE',
    url,
  });
};
