import { useQuery } from "@tanstack/react-query";

import {
  GetFADocsResponse,
  getFADocsService,
} from "@/services/fixed-assets/getFADocsService";

interface UseGetFADocsQueryParams {
  enabled?: boolean;
  organizationId: string;
}

export const KEY_USE_GET_FA_DOCS = (organizationId: string) => [
  "faDocs",
  organizationId,
];

const useGetFADocsQuery = ({
  enabled = true,
  organizationId,
}: UseGetFADocsQueryParams) => {
  return useQuery<GetFADocsResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () => getFADocsService({ organizationId }),
    queryKey: KEY_USE_GET_FA_DOCS(organizationId),
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetFADocsQuery;
