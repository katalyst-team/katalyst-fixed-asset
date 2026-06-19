import {
  AttributeCollectionResponse,
  UpdateAttributeCollectionRequest,
} from "@/types/attributeCollection";

import fetcher from "../..";

export interface UpdateAttributeCollectionResponse {
  data: AttributeCollectionResponse;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

interface UpdateAttributeCollectionParams {
  organizationId: string;
  attributeCollectionId: string;
  payload: UpdateAttributeCollectionRequest;
}

export const updateAttributeCollectionService = async ({
  organizationId,
  attributeCollectionId,
  payload,
}: UpdateAttributeCollectionParams): Promise<UpdateAttributeCollectionResponse> => {
  const url = `/v1/organizations/${organizationId}/attribute-collections/${attributeCollectionId}`;
  return fetcher({
    data: payload,
    method: "PATCH",
    url,
  });
};
