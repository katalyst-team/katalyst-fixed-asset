import { Filter } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/user-context";
import useGetEmployeeDataQuery from "@/hooks/api/employee/getEmployeeDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import {
  AuditResult,
  AuditStatus,
  AuditType,
  StockAuditFilterOptions,
} from "@/types/stock-audit";

interface StockAuditFilterProps {
  onApply: (filters: StockAuditFilterOptions) => void;
  currentStoreId: string;
}

const StockAuditFilter: React.FC<StockAuditFilterProps> = ({
  onApply,
  currentStoreId,
}) => {
  const { t } = useTranslation("stock-audit");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // State Management
  const [type, setType] = useState<AuditType | "all" | undefined>(undefined);
  const [status, setStatus] = useState<AuditStatus | "all" | undefined>(
    undefined,
  );
  const [aorId, setAorId] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<AuditResult | "all" | undefined>(
    undefined,
  );
  const [checkingObjectId, setCheckingObjectId] = useState<string | undefined>(
    undefined,
  );
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("DESC");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // API Data Fetching
  const { data: employeeData } = useGetEmployeeDataQuery({
    organizationId,
  });

  const { data: storeAreaData } = useGetStoreAreaDataQuery({
    limit: 20,
    organizationId,
    storeId: currentStoreId,
  });

  const { data: skuData } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      limit: 10,
    },
    organizationId,
  });

  // Options for dropdowns
  const auditTypeOptions = [
    { label: t("filter.options.allTypes"), value: "all" },
    { label: t("modal.create.types.all"), value: "ALL" },
    { label: t("modal.create.types.bySection"), value: "BY_SECTION" },
    { label: t("modal.create.types.bySku"), value: "BY_SKU" },
  ];

  const auditStatusOptions = [
    { label: t("filter.options.allStatuses"), value: "all" },
    { label: t("status.pending"), value: "PENDING" },
    { label: t("status.completed"), value: "COMPLETED" },
  ];

  const auditResultOptions = [
    { label: t("filter.options.allResults"), value: "all" },
    { label: t("filter.options.consistent"), value: "CONSISTENT" },
    { label: t("filter.options.mismatch"), value: "MISMATCH" },
  ];

  const orderDirectionOptions = [
    { label: t("filter.options.newest"), value: "DESC" },
    { label: t("filter.options.oldest"), value: "ASC" },
  ];

  const employeeOptions = React.useMemo(() => {
    const options = [{ label: t("filter.options.allEmployees"), value: "all" }];

    if (employeeData?.data?.account_organizations) {
      const empOptions = employeeData.data.account_organizations.map(
        (employee) => ({
          label: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        }),
      );
      options.push(...empOptions);
    }

    return options;
  }, [employeeData, t]);

  const checkingObjectOptions = React.useMemo(() => {
    const options = [{ label: t("filter.options.allObjects"), value: "all" }];

    // Add sections if available
    if (storeAreaData?.data?.sections) {
      const sectionOptions = storeAreaData.data.sections.map((section) => ({
        label: `${t("table.header.area")}: ${section.name}`,
        value: section.id,
      }));
      options.push(...sectionOptions);
    }

    // Add SKUs if available
    if (skuData?.data?.skus) {
      const skuOptions = skuData.data.skus.map((sku) => ({
        label: `SKU: ${sku.name}`,
        value: sku.id,
      }));
      options.push(...skuOptions);
    }

    return options;
  }, [storeAreaData, skuData, t]);

  const handleApplyFilters = () => {
    const filters: StockAuditFilterOptions = {
      order_direction: orderDirection,
    };

    if (type && type !== "all") filters.type = type as AuditType;
    if (status && status !== "all") filters.status = status as AuditStatus;
    if (aorId && aorId !== "all") filters.aor_id = aorId;
    if (result && result !== "all") filters.result = result as AuditResult;
    if (checkingObjectId && checkingObjectId !== "all")
      filters.checking_object_id = checkingObjectId;
    onApply(filters);
    setIsPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setType("all");
    setStatus("all");
    setAorId("all");
    setResult("all");
    setCheckingObjectId("all");
    setOrderDirection("DESC");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (type && type !== "all") count++;
    if (status && status !== "all") count++;
    if (aorId && aorId !== "all") count++;
    if (result && result !== "all") count++;
    if (checkingObjectId && checkingObjectId !== "all") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className="relative" size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> {t("filter.button")}
          {activeFiltersCount > 0 && (
            <Badge className="absolute -right-2 -top-2 flex justify-center items-center h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{t("filter.title")}</h4>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t("filter.type.label")}</Label>
              <Combobox
                options={auditTypeOptions}
                placeholder={t("filter.type.placeholder")}
                value={type || "all"}
                onSelect={(value) =>
                  setType(value as AuditType | "all" | undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.status.label")}</Label>
              <Combobox
                options={auditStatusOptions}
                placeholder={t("filter.status.placeholder")}
                value={status || "all"}
                onSelect={(value) =>
                  setStatus(value as AuditStatus | "all" | undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.result.label")}</Label>
              <Combobox
                options={auditResultOptions}
                placeholder={t("filter.result.placeholder")}
                value={result || "all"}
                onSelect={(value) =>
                  setResult(value as AuditResult | "all" | undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.employee.label")}</Label>
              <Combobox
                options={employeeOptions}
                placeholder={t("filter.employee.placeholder")}
                value={aorId || "all"}
                onSelect={(value) => setAorId(value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.checkingObject.label")}</Label>
              <Combobox
                options={checkingObjectOptions}
                placeholder={t("filter.checkingObject.placeholder")}
                value={checkingObjectId || "all"}
                onSelect={(value) => setCheckingObjectId(value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filter.order.label")}</Label>
              <Combobox
                options={orderDirectionOptions}
                placeholder={t("filter.order.placeholder")}
                value={orderDirection}
                onSelect={(value) => setOrderDirection(value as "ASC" | "DESC")}
              />
            </div>

          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleApplyFilters}>
              {t("filter.apply")}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleResetFilters}
            >
              {t("filter.reset")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StockAuditFilter;
