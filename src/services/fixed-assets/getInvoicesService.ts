import type { FaInvoice } from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type GetInvoicesResponse = ApiResponse<{ invoices: FaInvoice[] }>;

interface GetInvoicesParams {
  organizationId: string;
}

export const getInvoicesService = async ({
  organizationId,
}: GetInvoicesParams): Promise<GetInvoicesResponse> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/fa/billing/invoices`,
  });
};
