export interface GetActiveLicenseParams {
  organizationId: string;
}

export interface LicenseData {
  ext_id: string;
  organization_id: string;
  subscription_type: "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  start_date: string;
  expired_date: string;
  max_stores: number;
  max_users: number;
}

export interface GetActiveLicenseResponse {
  data: LicenseData;
}
