import fetcher, { ApiResponse } from "@/services";

interface ReplaceRfidParams {
  item_ids: string[];
  new_rfid_id: string;
  note?: string;
  old_rfid_id: string;
  organizationId: string;
}

interface ReplaceRfidResponse {
  item_ids: string[];
  new_rfid_id: string;
  old_rfid_id: string;
}

export const replaceRfidService = async ({
  item_ids,
  new_rfid_id,
  note,
  old_rfid_id,
  organizationId,
}: ReplaceRfidParams): Promise<ApiResponse<ReplaceRfidResponse>> => {
  return fetcher({
    data: { item_ids, new_rfid_id, note, old_rfid_id },
    method: "POST",
    url: `/v1/organizations/${organizationId}/rfids/replace-items`,
  });
};
