import { useTranslation } from "next-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchFilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  disabled?: boolean;
}

export function SearchFilterSection({
  disabled = false,
  searchQuery,
  setSearchQuery,
}: SearchFilterSectionProps) {
  const { t } = useTranslation("add-remove-rfid");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="sku-search">{t("search.label")}</Label>
      <Input
        disabled={disabled}
        id="sku-search"
        placeholder={t("search.placeholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
