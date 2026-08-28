import type {
  StartAuditSessionRequest,
  StartAuditSessionResult,
} from "@/types/fixed-assets";

import fetcher, { ApiResponse } from "..";

export type StartAuditSessionResponse = ApiResponse<StartAuditSessionResult>;

interface StartAuditSessionParams {
  data?: StartAuditSessionRequest;
  organizationId: string;
}

export const startAuditSessionService = async ({
  data,
  organizationId,
}: StartAuditSessionParams): Promise<StartAuditSessionResponse> => {
  return fetcher({
    data: data ?? {},
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/audit/sessions`,
  });
};
