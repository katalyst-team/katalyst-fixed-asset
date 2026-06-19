import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { AuditHistoryFilterOptions } from "@/types/stock-audit-area";

interface DetailStockAuditAreaHeaderProps {
  sectionName: string;
  onApplyFilters: (filters: AuditHistoryFilterOptions) => void;
  auditors?: { label: string; value: string }[];
  currentFilters: AuditHistoryFilterOptions;
}

const DetailStockAuditAreaHeader: React.FC<
  DetailStockAuditAreaHeaderProps
> = ({ sectionName, onApplyFilters, auditors = [], currentFilters }) => {
  const { t } = useTranslation("stock-audit-area");
  const router = useRouter();

  const [selectedAuditor, setSelectedAuditor] = useState<string | undefined>(
    currentFilters.auditor
  );
  const [selectedSort, setSelectedSort] = useState<"ASC" | "DESC" | undefined>(
    currentFilters.sort_order || "DESC"
  );

  const sortOptions = [
    { label: t("detailFilters.newest", "Newest"), value: "DESC" },
    { label: t("detailFilters.oldest", "Oldest"), value: "ASC" },
  ];

  const handleApply = () => {
    const filters: AuditHistoryFilterOptions = {
      sort_order: selectedSort,
    };
    if (selectedAuditor && selectedAuditor !== "all") {
      filters.auditor = selectedAuditor;
    }
    onApplyFilters(filters);
  };

  const handleBackClick = () => {
    router.push("/dashboard/stock-audit-area");
  };

  return (
    <div className="space-y-4">
      <Button
        className="flex items-center gap-2"
        size="sm"
        variant="ghost"
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("detailHeader.backToAreas", "Back to Areas")}
      </Button>

      <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">{sectionName}</h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "detailHeader.subtitle",
              "Audit history & actions for this area."
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
          {auditors.length > 0 && (
            <Combobox
              options={[
                { label: t("detailFilters.allAuditors", "All Auditors"), value: "all" },
                ...auditors,
              ]}
              placeholder={t("detailFilters.selectAuditor", "Filter by auditor...")}
              value={selectedAuditor || "all"}
              onSelect={(value) => setSelectedAuditor(value)}
            />
          )}
          <Combobox
            options={sortOptions}
            placeholder={t("detailFilters.sortBy", "Sort by...")}
            value={selectedSort}
            onSelect={(value) => setSelectedSort(value as "ASC" | "DESC")}
          />
          <Button size="sm" onClick={handleApply}>
            {t("detailFilters.apply", "Apply")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailStockAuditAreaHeader;
