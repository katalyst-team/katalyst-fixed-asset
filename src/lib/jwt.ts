import { jwtDecode } from "jwt-decode";
interface Permission {
  id: string;
  name: string;
}

export interface TokenPayload {
  account_id: string;
  account_status: string;
  organization_id: string;
  role_id: string;
  role: string;
  account_organization_role_id: string;
  account_organization_role_status: string;
  account_organization_role_version: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  permissions: Permission[];
  stores: Store[];
  exp: number;
  iat: number;
}

export interface Store {
  id: string;
  name: string;
}
export const decodeToken = (token: string): TokenPayload => {
  return jwtDecode(token);
};
