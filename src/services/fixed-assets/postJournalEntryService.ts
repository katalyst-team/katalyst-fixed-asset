import fetcher, { ApiResponse } from "..";

export type PostJournalEntryResponse = ApiResponse<Record<string, unknown>>;

interface PostJournalEntryParams {
  journalEntryId: string;
  organizationId: string;
}

export const postJournalEntryService = async ({
  journalEntryId,
  organizationId,
}: PostJournalEntryParams): Promise<PostJournalEntryResponse> => {
  return fetcher({
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/journal-entries/${journalEntryId}/post`,
  });
};
