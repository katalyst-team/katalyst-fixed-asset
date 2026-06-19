import { useTranslation } from "next-i18next";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";

interface StoreSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ALL_STORES_VALUE = "0";

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation(["sku", "st-basah-log"]);
  const { stores } = useUser();

  const storeOptions = React.useMemo(() => {
    const options: { label: string; value: string }[] = [
      {
        label: t("filter.options.allStores", {
          defaultValue: t("sku:filter.options.allStores", "All Stores"),
        }),
        value: ALL_STORES_VALUE,
      },
    ];
    options.push(
      ...stores.map((store) => ({
        label: store.name,
        value: store.id,
      })),
    );
    return options;
  }, [stores, t]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue
          placeholder={t("filter.selectStore", {
            defaultValue: t("sku:filter.selectStore", "Select Store..."),
          })}
        />
      </SelectTrigger>
      <SelectContent>
        {storeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
