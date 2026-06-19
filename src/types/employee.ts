import { OrganizationRoleName } from "./role";

export interface EmployeeItemType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: EmployeeStatus;
  otp_status?: EmployeeOtpStatus | null;
  role_id?: string;
  phone?: string | null;
  store_ids?: string[];
  account_organization_role?: {
    id: string;
    name: OrganizationRoleName;
    display_name?: string;
  };
  stores: {
    id: string;
    name: string;
  }[] | null;
}

export interface EmployeeFilterOptions {
  query?: string;
  status?: EmployeeStatus;
  store_ids?: string[];
  role_id?: string;
}

export interface CreateEmployeeParams {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: OrganizationRoleName;
  store_ids: string[];
  organization_id: string;
}

export interface UpdateEmployeeParams {
  name?: string;
  email?: string;
  phone?: string;
  new_email?: string;
  new_password?: string;
  role_id?: string;
  store_ids?: string[];
  status?: EmployeeStatus;
}

export interface Category {
  label: string;
  value: string;
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum EmployeeOtpStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}
