"use client";

import { useRouter } from "next/router";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { deserializeArray, serializeArray } from "@/utils/urlFilter";

import { useLaminaInboundLogStore } from "../store";

const LaminaInboundLogCategoryFilter: React.FC = () => {
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { filters, resetPagination, setFilters } = useLaminaInboundLogStore(
    useShallow((state) => ({
      filters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  const { data: categoryData, isLoading } = useGetCategoryDataQuery({ organizationId });

  const laminaCategoryOptions = React.useMemo(() => {
    const categories = categoryData?.data?.categories ?? [];
    return categories
      .filter((c) => c.name.startsWith("LAMINA"))
      .map((c) => ({ label: c.name, value: c.id }));
  }, [categoryData]);

  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (!router.isReady || initialized.current) return;
    initialized.current = true;
    const ids = deserializeArray(
      router.query.parent_category_ids as string | string[] | undefined,
    );
    if (ids && ids.length > 0) {
      setFilters((prev) => ({ ...prev, parent_category_ids: ids }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const selectedValues = filters.parent_category_ids ?? [];

  const handleChange = (values: string[]) => {
    resetPagination();
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      parent_category_ids: values.length > 0 ? values : undefined,
    }));
    const nextQuery = { ...router.query };
    const serialized = serializeArray(values);
    if (serialized) nextQuery.parent_category_ids = serialized;
    else delete nextQuery.parent_category_ids;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  return (
    <MultiCombobox
      containerClassName="w-[220px]"
      disabled={isLoading}
      emptyMessage="No LAMINA categories available"
      label=""
      options={laminaCategoryOptions}
      placeholder={isLoading ? "Loading..." : "Filter category..."}
      selectedValues={selectedValues}
      onValueChange={handleChange}
    />
  );
};

export default LaminaInboundLogCategoryFilter;
