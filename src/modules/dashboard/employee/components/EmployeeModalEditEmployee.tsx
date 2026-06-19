"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_EMPLOYEE_DATA } from "@/hooks/api/employee/getEmployeeDataQuery";
import useUpdateEmployeeDataMutation from "@/hooks/api/employee/useUpdateEmployeeDataMutation";
import useGetRoleDataQuery from "@/hooks/api/role/useGetRoleDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import {
  EmployeeItemType,
  EmployeeOtpStatus,
  EmployeeStatus,
} from "@/types/employee";

import { useEmployeeStore } from "../store";

interface EmployeeModalEditEmployeeProps {
  employee: EmployeeItemType;
}

const EmployeeModalEditEmployee = ({
  employee,
}: EmployeeModalEditEmployeeProps) => {
  const { t } = useTranslation(["employee"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { setFilters, resetPagination } = useEmployeeStore();
  const { mutateAsync: updateEmployeeData } = useUpdateEmployeeDataMutation();

  const initialRoleId =
    employee.role_id || employee.account_organization_role?.id || undefined;
  const initialStoreIds = useMemo(
    () => employee.stores?.map((store) => store.id) ?? [],
    [employee.stores]
  );
  const initialStoreIdsKey = useMemo(
    () => initialStoreIds.join(","),
    [initialStoreIds]
  );
  const initialStatus =
    employee.status === EmployeeStatus.INACTIVE
      ? EmployeeStatus.INACTIVE
      : employee.status === EmployeeStatus.SUSPENDED
        ? EmployeeStatus.SUSPENDED
        : EmployeeStatus.ACTIVE;
  const initialEmail = employee.email;
  const isOtpPending = employee.otp_status === EmployeeOtpStatus.PENDING;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string | undefined>(initialRoleId);
  const [storeIds, setStoreIds] = useState<string[]>(initialStoreIds);
  const [status, setStatus] = useState<EmployeeStatus | undefined>(
    initialStatus
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: roleData } = useGetRoleDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const roleOptions = useMemo(() => {
    if (!roleData?.data?.roles) return [];
    return roleData.data.roles.map((role) => ({
      label: role.display_name,
      value: role.id,
    }));
  }, [roleData]);

  const storeOptions = useMemo(() => {
    if (!storeData?.data?.stores) return [];
    return storeData.data.stores.map((store) => ({
      label: store.name,
      value: store.id,
    }));
  }, [storeData]);

  useEffect(() => {
    setRoleId(initialRoleId);
    setStoreIds(initialStoreIds);
    setStatus(initialStatus);
    setEmail(initialEmail);
    setPassword("");
  }, [initialEmail, initialRoleId, initialStatus, initialStoreIds]);

  const resetForm = () => {
    setRoleId(initialRoleId);
    setStoreIds(initialStoreIds);
    setStatus(initialStatus);
    setEmail(initialEmail);
    setPassword("");
  };

  const handleSave = async () => {
    if (!status || !roleId || storeIds.length === 0) {
      return;
    }
    const trimmedEmail = email.trim();
    const emailChanged = isOtpPending && trimmedEmail !== employee.email;
    const shouldUpdateEmail = emailChanged && trimmedEmail.length > 0;
    const shouldUpdatePassword = isOtpPending && password.length > 0;

    if (emailChanged && trimmedEmail.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEmployeeData({
        accountOrganizationId: employee.id,
        ...(shouldUpdateEmail ? { new_email: trimmedEmail } : {}),
        ...(shouldUpdatePassword ? { new_password: password } : {}),
        role_id: roleId,
        status,
        store_ids: storeIds,
      });

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

      toast.success(t("employee:toast.updated"));
      setOpen(false);
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (!isSubmitting) {
        setOpen(false);
        resetForm();
      }
    } else {
      setOpen(true);
    }
  };

  const trimmedEmail = email.trim();
  const emailChanged = isOtpPending && trimmedEmail !== employee.email;
  const passwordChanged = isOtpPending && password.length > 0;
  const isEmailInvalid = emailChanged && trimmedEmail.length === 0;

  const hasChanges =
    status !== initialStatus ||
    roleId !== initialRoleId ||
    storeIds.join(",") !== initialStoreIdsKey ||
    emailChanged ||
    passwordChanged;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ButtonEdit />
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("employee:modal.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("employee:modal.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-0.5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("employee:modal.edit.employee")}
              </p>
              <p className="text-sm font-semibold">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>

            {isOtpPending && (
              <>
                <InputWithLabel
                  label={t("employee:modal.edit.emailLabel")}
                  placeholder={t("employee:modal.edit.emailPlaceholder")}
                  type="email"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(event.target.value)
                  }
                />
                <InputWithLabel
                  isPassword
                  label={t("employee:modal.edit.passwordLabel")}
                  placeholder={t("employee:modal.edit.passwordPlaceholder")}
                  value={password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value)
                  }
                />
              </>
            )}

            <Combobox
              isRequired
              label={t("employee:modal.edit.roleLabel")}
              options={roleOptions}
              placeholder={t("employee:modal.edit.rolePlaceholder")}
              value={roleId}
              onSelect={setRoleId}
            />

            <MultiCombobox
              isRequired
              label={t("employee:modal.edit.storeLabel")}
              options={storeOptions}
              placeholder={t("employee:modal.edit.storePlaceholder")}
              selectedValues={storeIds}
              onValueChange={setStoreIds}
            />
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Pastikan store yang dipilih sudah benar sebelum menyimpan
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("employee:modal.edit.statusLabel")}
              </p>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as EmployeeStatus | undefined)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("employee:modal.edit.statusPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeeStatus.ACTIVE}>
                    {t("employee:table.status.active")}
                  </SelectItem>
                  <SelectItem value={EmployeeStatus.INACTIVE}>
                    {t("employee:table.status.inactive")}
                  </SelectItem>
                  <SelectItem value={EmployeeStatus.SUSPENDED}>
                    {t("employee:table.status.suspended")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          <Button
            disabled={
              isSubmitting ||
              !status ||
              !roleId ||
              storeIds.length === 0 ||
              isEmailInvalid ||
              !hasChanges
            }
            type="button"
            onClick={handleSave}
          >
            {isSubmitting
              ? t("employee:modal.edit.saving")
              : t("employee:modal.edit.saveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModalEditEmployee;
