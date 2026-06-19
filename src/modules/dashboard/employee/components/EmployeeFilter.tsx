"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/user-context";
import useGetRoleDataQuery from "@/hooks/api/role/useGetRoleDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { EmployeeFilterOptions, EmployeeStatus } from "@/types/employee";

import { useEmployeeStore } from "../store";

const EmployeeFilter: React.FC = () => {
  const { t } = useTranslation(["employee"]);
  const { tokenPayload } = useUser();
  const { setFilters, resetPagination } = useEmployeeStore();
  const router = useRouter();
  const urlInitialized = React.useRef(false);

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<EmployeeStatus | undefined>(
    undefined
  );
  const [storeIds, setStoreIds] = React.useState<string[]>([]);
  const [roleId, setRoleId] = React.useState<string | undefined>(undefined);

  // Initialize from URL once
  React.useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.query) setQuery(q.query);
    if (q.status) setStatus(q.status as EmployeeStatus);
    if (q.role_id) setRoleId(q.role_id);
    if (q.store_id) setStoreIds([q.store_id]);

    const hasFilters = q.query || q.status || q.role_id || q.store_id;
    if (hasFilters) {
      resetPagination();
      setFilters({
        query: q.query,
        role_id: q.role_id,
        status: q.status as EmployeeStatus | undefined,
        store_ids: q.store_id ? [q.store_id] : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: roleData } = useGetRoleDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const storeOptions = React.useMemo(() => {
    if (!storeData?.data?.stores) return [];
    return storeData.data.stores.map((store) => ({
      label: store.name,
      value: store.id,
    }));
  }, [storeData]);

  const roleOptions = React.useMemo(() => {
    if (!roleData?.data?.roles) return [];
    return roleData.data.roles.map((role) => ({
      label: role.display_name,
      value: role.id,
    }));
  }, [roleData]);

  const statuses = [
    { label: t("employee:filter.active"), value: EmployeeStatus.ACTIVE },
    { label: t("employee:filter.inactive"), value: EmployeeStatus.INACTIVE },
  ];

  const handleApply = () => {
    const filters: EmployeeFilterOptions = {
      query,
      role_id: roleId,
      status,
      store_ids: storeIds.length > 0 ? storeIds : undefined,
    };
    resetPagination();
    setFilters(filters);

    // Sync to URL
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.status;
    delete nextQuery.role_id;
    delete nextQuery.store_id;
    if (filters.query) nextQuery.query = filters.query;
    if (filters.status) nextQuery.status = filters.status;
    if (filters.role_id) nextQuery.role_id = filters.role_id;
    if (filters.store_ids?.[0]) nextQuery.store_id = filters.store_ids[0];
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const handleCancel = () => {
    setQuery("");
    setStatus(undefined);
    setStoreIds([]);
    setRoleId(undefined);

    // Clear URL params
    const nextQuery = { ...router.query };
    delete nextQuery.query;
    delete nextQuery.status;
    delete nextQuery.role_id;
    delete nextQuery.store_id;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const handleStatusSelect = (value: string | undefined) => {
    setStatus(value as EmployeeStatus | undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> {t("employee:filter.filter")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-4">
        <div className="space-y-4">
          <h2 className="font-semibold">{t("employee:filter.filter")}</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("employee:filter.search")}
            </label>
            <Input
              placeholder={t("employee:filter.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Combobox
            label={t("employee:filter.status")}
            options={statuses}
            placeholder={t("employee:filter.statusPlaceholder")}
            onSelect={handleStatusSelect}
          />

          <Combobox
            label={t("employee:filter.role")}
            options={roleOptions}
            placeholder={t("employee:filter.rolePlaceholder")}
            onSelect={setRoleId}
          />

          <Combobox
            label={t("employee:filter.store")}
            options={storeOptions}
            placeholder={t("employee:filter.storePlaceholder")}
            onSelect={(value) => setStoreIds(value ? [value] : [])}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {t("employee:filter.cancel")}
            </Button>
            <Button onClick={handleApply}>{t("employee:filter.apply")}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmployeeFilter;
