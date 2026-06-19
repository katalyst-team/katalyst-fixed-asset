import { CreateAttributeRequest } from '@/types/attribute';

import fetcher, { ApiResponse } from '..';

export interface CreateAttributeDataResponse extends ApiResponse<{ id: string }> {
  id: string;
}

interface CreateAttributeDataParams {
  organizationId: string;
  data: CreateAttributeRequest;
}

export const createAttributeDataService = async ({
  organizationId,
  data,
}: CreateAttributeDataParams): Promise<CreateAttributeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/attributes`;
  return fetcher({
    data,
    method: 'POST',
    url,
  });
};
