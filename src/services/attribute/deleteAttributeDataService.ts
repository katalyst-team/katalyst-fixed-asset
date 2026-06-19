import fetcher, { ApiResponse } from '..';

export interface DeleteAttributeDataResponse extends ApiResponse<{ id: string }> {
  id: string;
}

interface DeleteAttributeDataParams {
  organizationId: string;
  attributeId: string;
}

export const deleteAttributeDataService = async ({
  organizationId,
  attributeId,
}: DeleteAttributeDataParams): Promise<DeleteAttributeDataResponse> => {
  const url = `/v1/organizations/${organizationId}/attributes/${attributeId}`;
  return fetcher({
    method: 'DELETE',
    url,
  });
};
