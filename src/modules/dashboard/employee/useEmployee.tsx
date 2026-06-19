"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useGetEmployeeDataQuery from "@/hooks/api/employee/getEmployeeDataQuery";
import { EmployeeItemType } from "@/types/employee";

import { useEmployeeStore } from "./store";

interface UseEmployeeReturn {
  employeeData: EmployeeItemType[];
  isLoadingEmployeeData: boolean;
  totalItems: number;
}

export const useEmployee = (): UseEmployeeReturn => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const itemLimit = useEmployeeStore((state) => state.itemLimit);
  const currentPage = useEmployeeStore((state) => state.currentPage);
  const filters = useEmployeeStore(useShallow((state) => state.filters));

  const { data, isLoading, isFetching } = useGetEmployeeDataQuery({
    filters,
    organizationId,
  });

  // Client-side pagination (Employee API returns all data at once)
  const { paginatedData, totalItems } = useMemo(() => {
    const accountOrganizations = data?.data?.account_organizations || [];
    const total = accountOrganizations.length;
    const startIndex = (currentPage - 1) * itemLimit;
    const endIndex = startIndex + itemLimit;
    const paginated = accountOrganizations.slice(startIndex, endIndex);

    return {
      paginatedData: paginated,
      totalItems: total,
    };
  }, [data, currentPage, itemLimit]);

  return {
    employeeData: paginatedData,
    isLoadingEmployeeData: isLoading || isFetching,
    totalItems,
  };
};
