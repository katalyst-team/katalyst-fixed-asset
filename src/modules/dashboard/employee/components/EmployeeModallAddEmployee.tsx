"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
} from "@/components/ui/dialog";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_EMPLOYEE_DATA } from "@/hooks/api/employee/getEmployeeDataQuery";
import useCreateEmployeeDataMutation from "@/hooks/api/employee/useCreateEmployeeDataMutation";
import useGetRoleDataQuery from "@/hooks/api/role/useGetRoleDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { OrganizationRoleName } from "@/types/role";

import { useEmployeeStore } from "../store";

const EmployeeModalAddEmployee = () => {
  const { t } = useTranslation(["employee"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { resetPagination, setFilters } = useEmployeeStore();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<OrganizationRoleName | undefined>(undefined);
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createEmployeeData } = useCreateEmployeeDataMutation();

  const { data: roleData } = useGetRoleDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const roleOptions = useMemo(() => {
    if (!roleData?.data?.roles) return [];
    return roleData.data.roles.map((roleItem) => ({
      label: roleItem.display_name,
      value: roleItem.name,
    }));
  }, [roleData]);

  const storeOptions = useMemo(() => {
    if (!storeData?.data?.stores) return [];
    return storeData.data.stores.map((store) => ({
      label: store.name,
      value: store.id,
    }));
  }, [storeData]);

  const resetForm = () => {
    setEmail("");
    setName("");
    setLastName("");
    setPhone("");
    setPassword("");
    setRole(undefined);
    setStoreIds([]);
  };

  const handleCreateEmployee = async () => {
    if (
      !email ||
      !name ||
      !phone ||
      !password ||
      !role ||
      storeIds.length === 0
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createEmployeeData({
        email,
        first_name: name,
        last_name: lastName,
        password,
        phone,
        role,
        store_ids: storeIds,
      });

      setFilters({});
      resetPagination();

      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_EMPLOYEE_DATA(
          tokenPayload?.organization_id ?? "",
          undefined
        ),
      });

      toast.success(t("employee:toast.created"));
      setOpen(false);
      resetForm();
    } catch (e) {
      toastError(e as Error);
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

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {t("employee:modal.addEmployee.addButton")}
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {t("employee:modal.addEmployee.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("employee:modal.addEmployee.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="flex flex-col gap-4 py-4">
              <InputWithLabel
                isRequired
                label={t("employee:modal.addEmployee.emailLabel")}
                placeholder={t("employee:modal.addEmployee.emailPlaceholder")}
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <InputWithLabel
                isRequired
                label={t("employee:modal.addEmployee.nameLabel")}
                placeholder={t("employee:modal.addEmployee.namePlaceholder")}
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
              <InputWithLabel
                isRequired
                label={t("employee:modal.addEmployee.lastNameLabel")}
                placeholder={t(
                  "employee:modal.addEmployee.lastNamePlaceholder"
                )}
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
              />
              <InputWithLabel
                isRequired
                label={t("employee:modal.addEmployee.phoneLabel")}
                placeholder={t("employee:modal.addEmployee.phonePlaceholder")}
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
              />
              <InputWithLabel
                isPassword
                isRequired
                label={t("employee:modal.addEmployee.passwordLabel")}
                placeholder={t(
                  "employee:modal.addEmployee.passwordPlaceholder"
                )}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              <Combobox
                isRequired
                label={t("employee:modal.addEmployee.roleLabel")}
                options={roleOptions}
                placeholder={t("employee:modal.addEmployee.rolePlaceholder")}
                value={role}
                onSelect={(selectedRole) =>
                  setRole(selectedRole as OrganizationRoleName | undefined)
                }
              />
              <MultiCombobox
                isRequired
                label={t("employee:modal.addEmployee.storeLabel")}
                options={storeOptions}
                placeholder={t("employee:modal.addEmployee.storePlaceholder")}
                selectedValues={storeIds}
                onValueChange={setStoreIds}
              />
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Pastikan store yang dipilih sudah benar sebelum menyimpan
              </p>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t pt-4">
            <Button
              disabled={isSubmitting}
              type="button"
              onClick={handleCreateEmployee}
            >
              {isSubmitting
                ? t("employee:modal.addEmployee.creating")
                : t("employee:modal.addEmployee.createButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeModalAddEmployee;
