import { useQuery } from "@tanstack/react-query";

import {
  GetJournalEntriesResponse,
  getJournalEntriesService,
} from "@/services/fixed-assets/getJournalEntriesService";

interface UseGetJournalEntriesQueryParams {
  enabled?: boolean;
  limit?: number;
  organizationId: string;
  page?: number;
  status?: string;
  type?: string;
}

export const KEY_USE_GET_FA_JOURNAL_ENTRIES = (
  organizationId: string,
  status?: string,
  type?: string,
) => ["faJournalEntries", organizationId, status, type];

const useGetJournalEntriesQuery = ({
  enabled = true,
  limit,
  organizationId,
  page,
  status,
  type,
}: UseGetJournalEntriesQueryParams) => {
  return useQuery<GetJournalEntriesResponse, Error>({
    enabled: Boolean(organizationId && enabled),
    queryFn: () =>
      getJournalEntriesService({ limit, organizationId, page, status, type }),
    queryKey: KEY_USE_GET_FA_JOURNAL_ENTRIES(organizationId, status, type),
    staleTime: 30 * 1000,
  });
};

export default useGetJournalEntriesQuery;
