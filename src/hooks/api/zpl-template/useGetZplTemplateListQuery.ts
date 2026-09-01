import { useQuery } from "@tanstack/react-query";

import {
  GetZplTemplateListResponse,
  getZplTemplateListService,
} from "@/services/zpl-template/getZplTemplateListService";

export const KEY_USE_GET_ZPL_TEMPLATE_LIST = (organizationId: string) => [
  "zplTemplateList",
  organizationId,
];

interface UseGetZplTemplateListQueryParams {
  enabled?: boolean;
  organizationId: string;
}

const useGetZplTemplateListQuery = ({
  enabled = true,
  organizationId,
}: UseGetZplTemplateListQueryParams) => {
  return useQuery<GetZplTemplateListResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getZplTemplateListService({ organizationId }),
    queryKey: KEY_USE_GET_ZPL_TEMPLATE_LIST(organizationId),
    staleTime: 60 * 1000,
  });
};

export default useGetZplTemplateListQuery;
