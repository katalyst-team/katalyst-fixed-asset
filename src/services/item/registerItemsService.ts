import fetcher from "@/services";
import type {
  RegisterItemsApiResponse,
  RegisterItemsServiceParams,
} from "@/types/rstCutting";

export const registerItemsService = async ({
  organizationId,
  storeId,
  data,
}: RegisterItemsServiceParams): Promise<RegisterItemsApiResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/register-items`,
  });
};
