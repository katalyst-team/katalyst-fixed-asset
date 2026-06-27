import fetcher, { ApiResponse } from "..";

export interface InsurancePolicyPayload {
  contact_email?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  coverage_amount: number;
  document_url?: string | null;
  expiry_date?: string | null;
  insurer_name: string;
  policy_number: string;
  policy_type: string;
  premium: number;
  renewal_reminder_days?: number;
}

export type CreateInsurancePolicyResponse = ApiResponse<{ ext_id: string }>;

interface CreateInsurancePolicyParams {
  data: InsurancePolicyPayload;
  organizationId: string;
}

export const createInsurancePolicyService = async ({
  data,
  organizationId,
}: CreateInsurancePolicyParams): Promise<CreateInsurancePolicyResponse> => {
  return fetcher({
    data,
    method: "POST",
    url: `/v1/organizations/${organizationId}/fa/finance/insurance`,
  });
};
