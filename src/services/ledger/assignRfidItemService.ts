import fetcher from "@/services";

interface AssignRfidItemServiceParams {
  organizationId: string;
  storeId: string;
  itemId: string;
  params: {
    action: "ADD" | "REMOVE";
    epc: string;
  };
}

export const assignRfidItemService = async ({
  organizationId,
  storeId,
  itemId,
  params,
}: AssignRfidItemServiceParams): Promise<unknown> => {
  return fetcher({
    data: params,
    method: "POST",
    url: `/v1/organizations/${organizationId}/stores/${storeId}/items/${itemId}/rfids`,
  });
};
