import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerificationEntityType } from "@/types/verification";

interface StoreOption {
  id: string;
  name: string;
}

interface VerificationHeaderProps {
  entityTypeFilter: VerificationEntityType;
  onEntityTypeChange: (value: VerificationEntityType) => void;
  onStoreChange: (value: string | undefined) => void;
  storeFilter: string | undefined;
  stores: StoreOption[];
}

const VerificationHeader = ({
  entityTypeFilter,
  onEntityTypeChange,
  onStoreChange,
  storeFilter,
  stores,
}: VerificationHeaderProps) => {
  const { t } = useTranslation("verification");

  const storeOptions = useMemo(
    () => stores.map((store) => ({ label: store.name, value: store.id })),
    [stores],
  );

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Combobox
          options={storeOptions}
          placeholder={t("filter.store")}
          value={storeFilter ?? ""}
          onSelect={(val) => onStoreChange(val || undefined)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={entityTypeFilter}
          onValueChange={(val) => onEntityTypeChange(val as VerificationEntityType)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filter.entityType")} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(VerificationEntityType).map((type) => (
              <SelectItem key={type} value={type}>
                {t(`entityType.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VerificationHeader;
