import type { FaJournalEntry } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetJournalEntriesResponse = ApiResponse<{
  journal_entries: FaJournalEntry[];
  total: number;
}>;

interface GetJournalEntriesParams {
  limit?: number;
  organizationId: string;
  page?: number;
  status?: string;
  type?: string;
}

export const getJournalEntriesService = async ({
  limit,
  organizationId,
  page,
  status,
  type,
}: GetJournalEntriesParams): Promise<GetJournalEntriesResponse> => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/journal-entries${qs}`,
  });
};
