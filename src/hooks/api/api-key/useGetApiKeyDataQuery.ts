import { useQuery } from "@tanstack/react-query";

import {
  GetApiKeyDataResponse,
  getApiKeyDataService,
} from "@/services/api-key/getApiKeyDataService";
import { GetApiKeyDataParams } from "@/types/api-key";

export const KEY_USE_GET_API_KEY_DATA = (
  organizationID: string,
  accountOrganizationID: string
) => ["apiKeyData", organizationID, accountOrganizationID];

const useGetApiKeyDataQuery = ({
  organizationID,
  accountOrganizationID,
}: GetApiKeyDataParams) => {
  return useQuery<GetApiKeyDataResponse, Error>({
    enabled: Boolean(organizationID) && Boolean(accountOrganizationID),
    queryFn: () =>
      getApiKeyDataService({ accountOrganizationID, organizationID }),
    queryKey: KEY_USE_GET_API_KEY_DATA(organizationID, accountOrganizationID),
    staleTime: 60 * 1000,
  });
};

export default useGetApiKeyDataQuery;
