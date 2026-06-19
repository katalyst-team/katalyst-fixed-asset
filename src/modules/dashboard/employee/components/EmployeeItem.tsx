import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_EMPLOYEE_DATA } from "@/hooks/api/employee/getEmployeeDataQuery";
import useDeleteEmployeeDataMutation from "@/hooks/api/employee/useDeleteEmployeeDataMutation";
import { toastError } from "@/services";
import {
  EmployeeItemType,
  EmployeeOtpStatus,
  EmployeeStatus,
} from "@/types/employee";
import { OrganizationRoleName } from "@/types/role";
import { convertToTitleCase } from "@/utils/text";

import { useEmployeeStore } from "../store";
import EmployeeModalEditEmployee from "./EmployeeModalEditEmployee";

interface EmployeeItemProps {
  item: EmployeeItemType;
  num?: number;
}

const EmployeeItem: React.FC<EmployeeItemProps> = ({ item, num }) => {
  const { t } = useTranslation(["employee"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { setFilters, resetPagination } = useEmployeeStore();
  const { mutateAsync: deleteEmployeeData } = useDeleteEmployeeDataMutation();

  const roleName = item.account_organization_role?.name;
  const roleDisplayName = item.account_organization_role?.display_name;
  const isCurrentUser =
    tokenPayload?.email &&
    item.email &&
    tokenPayload.email.toLowerCase() === item.email.toLowerCase();

  const getRoleLabel = (role?: OrganizationRoleName, displayName?: string) => {
    // Use display_name from API if available
    if (displayName) return displayName;
    if (!role) return "-";
    return t(`employee:roles.${role}`, convertToTitleCase(role));
  };

  const getOtpStatusLabel = (status?: EmployeeOtpStatus | null) => {
    if (!status) return "-";
    return status === EmployeeOtpStatus.ACTIVE
      ? t("employee:table.otpStatus.active")
      : status === EmployeeOtpStatus.PENDING
        ? t("employee:table.otpStatus.pending")
        : t("employee:table.otpStatus.inactive");
  };

  const getOtpStatusVariant = (status?: EmployeeOtpStatus | null) => {
    if (!status) return "outline";
    if (status === EmployeeOtpStatus.ACTIVE) return "default";
    if (status === EmployeeOtpStatus.PENDING) return "secondary";
    return "destructive";
  };

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await deleteEmployeeData({ accountOrganizationId: item.id });

      // Reset filters and pagination
      setFilters({});
      resetPagination();

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_EMPLOYEE_DATA(
          tokenPayload?.organization_id ?? "",
          undefined
        ),
      });

      toast.success(t("employee:toast.deleted"));
    } catch (error) {
      toastError(error as Error);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>{item.first_name}</TableCell>
      <TableCell>{getRoleLabel(roleName, roleDisplayName)}</TableCell>
      <TableCell>{item.email}</TableCell>
      <TableCell>{item.phone || "-"}</TableCell>
      <TableCell>
        <Badge
          variant={
            item.status === EmployeeStatus.ACTIVE
              ? "default"
              : item.status === EmployeeStatus.SUSPENDED
                ? "secondary"
                : "destructive"
          }
        >
          {item.status === EmployeeStatus.ACTIVE
            ? t("employee:table.status.active")
            : item.status === EmployeeStatus.SUSPENDED
              ? t("employee:table.status.suspended")
              : t("employee:table.status.inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        {item.otp_status ? (
          <Badge variant={getOtpStatusVariant(item.otp_status)}>
            {getOtpStatusLabel(item.otp_status)}
          </Badge>
        ) : (
          getOtpStatusLabel(item.otp_status)
        )}
      </TableCell>
      <TableCell>
        {item.stores && item.stores.length > 0
          ? item.stores.map((store) => store.name).join(", ")
          : "-"}
      </TableCell>

      <TableCell>
        {isCurrentUser ? (
          "-"
        ) : (
          <div className="flex gap-2">
            <EmployeeModalEditEmployee employee={item} />
            <ButtonDelete onSubmit={handleDelete} />
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EmployeeItem;
