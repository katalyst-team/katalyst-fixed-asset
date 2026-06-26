import type { FaFinanceSummary, FaJournalEntry } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetJournalEntriesResponse = ApiResponse<{
  entries: FaJournalEntry[];
  summary: FaFinanceSummary;
}>;

interface GetJournalEntriesParams {
  cursor?: string;
  limit?: number;
  organizationId: string;
  status?: string;
  type?: string;
}

export const getJournalEntriesService = async ({
  cursor,
  limit,
  organizationId,
  status,
  type,
}: GetJournalEntriesParams): Promise<GetJournalEntriesResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/finance/journal-entries${qs}`,
  });
};
