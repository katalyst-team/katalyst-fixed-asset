"use client";

import { Filter } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { LedgerFilter as LedgerFilterType } from "@/types/ledger";

import { useLedger } from "./useLedger";

interface LedgerFilterProps {
  test?: string;
}

const LedgerFilter: React.FC<LedgerFilterProps> = ({}) => {
  const { tokenPayload } = useUser();
  const { setFilters } = useLedger();
  const [sku, setSku] = useState("");
  const [skuName, setSkuName] = useState("");
  const [statusId, setStatusId] = useState<string | undefined>(undefined);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // Fetch categories
  const { data: categoryData } = useGetCategoryDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const categoryOptions = useMemo(() => {
    if (!categoryData?.data?.categories) return [];
    return categoryData.data.categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categoryData]);

  const statusOptions = [
    { label: "Active", value: "1" },
    { label: "Inactive", value: "2" },
  ];

  const handleApply = () => {
    const filters: LedgerFilterType = {
      category_ids: categoryIds.length > 0 ? categoryIds : undefined,
      sku: sku || undefined,
      sku_name: skuName || undefined,
      status_id: statusId,
    };
    setFilters(filters);
  };

  const handleCancel = () => {
    setSku("");
    setSkuName("");
    setStatusId(undefined);
    setCategoryIds([]);
    setFilters({});
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[400px] p-4">
          <div className="space-y-4">
            <h2 className="border-b border-border pb-3 mb-3 font-semibold text-sm">Filter Items</h2>

            <div className="border-b border-border/50 pb-3 mb-3">
              <Combobox
                label="Status"
                options={statusOptions}
                placeholder="Select Status"
                onSelect={setStatusId}
              />
            </div>

            <Combobox
              label="Category"
              options={categoryOptions}
              placeholder="Select Category"
              onSelect={(value) => setCategoryIds(value ? [value] : [])}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleApply}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LedgerFilter;
