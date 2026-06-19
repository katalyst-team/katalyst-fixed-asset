"use client";

import { useTranslation } from "next-i18next";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeItemType } from "@/types/employee";

import {
  EmployeeHeader,
  EmployeeItem,
  EmployeeModalAddEmployee,
} from "./components";
import { useEmployeeStore } from "./store";
import { useEmployee } from "./useEmployee";

const Employee = () => {
  const { t } = useTranslation(["employee"]);
  const { employeeData, isLoadingEmployeeData, totalItems } = useEmployee();

  // Use Zustand store - get primitive values
  const currentPage = useEmployeeStore((state) => state.currentPage);
  const itemsPerPage = useEmployeeStore((state) => state.itemLimit);

  return (
    <div
      className={`flex flex-col gap-6 ${employeeData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <EmployeeHeader totalItems={totalItems} />

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${employeeData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead>{t("employee:table.header.id")}</TableHead>
              <TableHead>{t("employee:table.header.name")}</TableHead>
              <TableHead>{t("employee:table.header.role")}</TableHead>
              <TableHead>{t("employee:table.header.email")}</TableHead>
              <TableHead>{t("employee:table.header.phone")}</TableHead>
              <TableHead>{t("employee:table.header.status")}</TableHead>
              <TableHead>{t("employee:table.header.otpStatus")}</TableHead>
              <TableHead>{t("employee:table.header.stores")}</TableHead>
              <TableHead>{t("employee:table.header.actions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoadingEmployeeData &&
              employeeData.length > 0 &&
              employeeData.map((item: EmployeeItemType, index: number) => (
                <EmployeeItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingEmployeeData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          employeeData.length === 0 && (
            <EmptyState
              action={<EmployeeModalAddEmployee />}
              className="mt-4"
              description={t("empty.description")}
              title={t("empty.title")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Employee;
