import fetcher, { ApiResponse } from "@/services";

export interface NextReferenceNumberResponse {
  reference_number: string;
}

interface GetNextReferenceNumberParams {
  organizationId: string;
  storeId: string;
}

export const getNextReferenceNumberService = async ({
  organizationId,
  storeId,
}: GetNextReferenceNumberParams): Promise<
  ApiResponse<NextReferenceNumberResponse>
> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/stock-movements/next-reference-number`,
  });
};
