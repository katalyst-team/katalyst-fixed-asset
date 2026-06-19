import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { Combobox } from "@/components/ui/combobox";

interface StoreOption {
  id: string;
  name: string;
}

interface VerificationStBasahHeaderProps {
  onStoreChange: (value: string | undefined) => void;
  storeFilter: string | undefined;
  stores: StoreOption[];
}

const VerificationStBasahHeader = ({
  onStoreChange,
  storeFilter,
  stores,
}: VerificationStBasahHeaderProps) => {
  const { t } = useTranslation("verification-st-basah");

  const storeOptions = useMemo(
    () => stores.map((store) => ({ label: store.name, value: store.id })),
    [stores],
  );

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4">
      <Combobox
        options={storeOptions}
        placeholder={t("filter.store")}
        value={storeFilter ?? ""}
        onSelect={(val) => onStoreChange(val || undefined)}
      />
    </div>
  );
};

export default VerificationStBasahHeader;
