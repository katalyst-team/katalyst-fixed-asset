export interface ApiKeyItemType {
  id: string;
  key: string;
  status: "ACTIVE" | "INACTIVE";
  created_at?: string;
  updated_at?: string;
}

export interface ApiKeyFilterOptions {
  name?: string;
  status?: string;
}

export interface PostApiKeyDataParams {
  organization_id: string;
  account_organization_id: string;
}

export interface PatchApiKeyDataParams {
  keyID: string;
  organizationID: string;
  accountOrganizationID: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface DeleteApiKeyDataParams {
  keyID: string;
  organizationID: string;
  accountOrganizationID: string;
}

export interface GetApiKeyDataParams {
  organizationID: string;
  accountOrganizationID: string;
}