import type { FaDisposalJournalEntry } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type PostDisposalJournalEntryResponse = ApiResponse<FaDisposalJournalEntry>;

interface PostDisposalJournalEntryParams {
  disposalId: string;
  organizationId: string;
}

export const postDisposalJournalEntryService = async ({
  disposalId,
  organizationId,
}: PostDisposalJournalEntryParams): Promise<PostDisposalJournalEntryResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/disposals/${disposalId}/journal-entry`,
  });
};
