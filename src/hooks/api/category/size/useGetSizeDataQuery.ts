import { useQuery } from "@tanstack/react-query";

import { getSizeDataService } from "../../../../services/category/size/getSizeDataService";

interface UseGetSizeDataQueryParams {
  organizationId: string;
}

export const KEY_USE_GET_SIZE_DATA_QUERY = (organizationId: string) => [
  "sizes",
  organizationId,
];

export const useGetSizeDataQuery = ({
  organizationId,
}: UseGetSizeDataQueryParams) => {
  return useQuery({
    queryFn: () => getSizeDataService({ organizationId }),
    queryKey: KEY_USE_GET_SIZE_DATA_QUERY(organizationId),
  });
};
