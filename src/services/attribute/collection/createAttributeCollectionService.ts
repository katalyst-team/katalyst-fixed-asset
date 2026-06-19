import {
  AttributeCollectionResponse,
  CreateAttributeCollectionRequest,
} from "@/types/attributeCollection";

import fetcher from "../..";

export interface CreateAttributeCollectionResponse {
  data: AttributeCollectionResponse;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

interface CreateAttributeCollectionParams {
  organizationId: string;
  payload: CreateAttributeCollectionRequest;
}

export const createAttributeCollectionService = async ({
  organizationId,
  payload,
}: CreateAttributeCollectionParams): Promise<CreateAttributeCollectionResponse> => {
  const url = `/v1/organizations/${organizationId}/attribute-collections`;
  return fetcher({
    data: payload,
    method: "POST",
    url,
  });
};
