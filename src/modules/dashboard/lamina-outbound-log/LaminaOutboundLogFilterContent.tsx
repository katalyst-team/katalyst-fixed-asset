import { useTranslation } from "next-i18next";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { SelectCombobox } from "@/components/ui/select-combobox";

type Option = { label: string; value: string };

interface LaminaOutboundLogFilterContentProps {
  editorAorId: string | undefined;
  employeeOptions: Option[];
  hasStoreSelector: boolean;
  isLoadingEmployees: boolean;
  isLoadingStockMovementTypes: boolean;
  isLoadingStoreAreas: boolean;
  isLoadingStores: boolean;
  lastUpdatedEndDate: Date | undefined;
  lastUpdatedStartDate: Date | undefined;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
  onTimeframeChange: (value: string) => void;
  orderDirection: string | undefined;
  orderDirectionOptions: Option[];
  rfidCategory: string | undefined;
  rfidCategoryOptions: Option[];
  rfidType: string | undefined;
  rfidTypeOptions: Option[];
  sectionId: string | undefined;
  selectedStoreForSection: string | undefined;
  selectedTeam: string;
  setEditorAorId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLastUpdatedEnd: React.Dispatch<React.SetStateAction<string>>;
  setLastUpdatedStart: React.Dispatch<React.SetStateAction<string>>;
  setOrderDirection: React.Dispatch<React.SetStateAction<string | undefined>>;
  setRfidCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
  setRfidType: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSectionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSelectedStoreForSection: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setStockMovementTypeIds: React.Dispatch<React.SetStateAction<string[]>>;
  stockMovementTypeIds: string[];
  stockMovementTypeMultiOptions: Option[];
  storeAreaOptions: Option[];
  storeOptions: Option[];
  timeframe: string;
  timeframeOptions: Option[];
  toEndOfDayISO: (d?: Date) => string;
  toStartOfDayISO: (d?: Date) => string;
}

const LaminaOutboundLogFilterContent: React.FC<
  LaminaOutboundLogFilterContentProps
> = (props) => {
  const { t } = useTranslation("outbound");
  const {
    editorAorId,
    employeeOptions,
    hasStoreSelector,
    isLoadingEmployees,
    isLoadingStockMovementTypes,
    isLoadingStoreAreas,
    isLoadingStores,
    lastUpdatedEndDate,
    lastUpdatedStartDate,
    onApply,
    onCancel,
    onReset,
    onTimeframeChange,
    orderDirection,
    orderDirectionOptions,
    rfidCategory,
    rfidCategoryOptions,
    rfidType,
    rfidTypeOptions,
    sectionId,
    selectedStoreForSection,
    selectedTeam,
    setEditorAorId,
    setLastUpdatedEnd,
    setLastUpdatedStart,
    setOrderDirection,
    setRfidCategory,
    setRfidType,
    setSectionId,
    setSelectedStoreForSection,
    setStockMovementTypeIds,
    stockMovementTypeIds,
    stockMovementTypeMultiOptions,
    storeAreaOptions,
    storeOptions,
    timeframe,
    timeframeOptions,
    toEndOfDayISO,
    toStartOfDayISO,
  } = props;

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Combobox
          label={t("filter.timeframe", "Time Range")}
          options={timeframeOptions}
          placeholder={t("filter.timeframePlaceholder", "Select time range...")}
          value={timeframe}
          onSelect={(value) => onTimeframeChange(value || "all")}
        />
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("filter.lastUpdatedStart", "Last Updated Start")}
          </Label>
          <DatePicker
            buttonClassName="w-full"
            className="w-full"
            id="lastUpdatedStart"
            placeholder={t("filter.lastUpdatedStart", "Last Updated Start")}
            value={lastUpdatedStartDate}
            onChangeAction={(d) => setLastUpdatedStart(toStartOfDayISO(d))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("filter.lastUpdatedEnd", "Last Updated End")}
          </Label>
          <DatePicker
            buttonClassName="w-full"
            className="w-full"
            id="lastUpdatedEnd"
            placeholder={t("filter.lastUpdatedEnd", "Last Updated End")}
            value={lastUpdatedEndDate}
            onChangeAction={(d) => setLastUpdatedEnd(toEndOfDayISO(d))}
          />
        </div>
        <Combobox
          label={t("filter.orderDirection", "Sort Order")}
          options={orderDirectionOptions}
          placeholder={t("filter.orderDirectionPlaceholder", "Select sort order...")}
          value={orderDirection}
          onSelect={setOrderDirection}
        />
        <Combobox
          label={t("filter.editor", "Editor/Operator")}
          options={employeeOptions}
          placeholder={
            isLoadingEmployees
              ? t("loading", "Loading...")
              : t("filter.editorPlaceholder", "Select editor...")
          }
          value={editorAorId}
          onSelect={setEditorAorId}
        />
        {hasStoreSelector && (
          <Combobox
            label={t("filter.store", "Store")}
            options={storeOptions}
            placeholder={
              isLoadingStores
                ? t("loading", "Loading...")
                : t("filter.storePlaceholder", "Select store...")
            }
            value={selectedStoreForSection}
            onSelect={setSelectedStoreForSection}
          />
        )}
        {(selectedTeam !== "0" ||
          (selectedTeam === "0" && selectedStoreForSection !== "all")) && (
          <SelectCombobox
            label={t("filter.storeArea", "Store Area")}
            options={storeAreaOptions}
            placeholder={
              isLoadingStoreAreas
                ? t("loading", "Loading...")
                : t("filter.storeAreaPlaceholder", "Select store area...")
            }
            value={sectionId}
            onSelect={setSectionId}
          />
        )}
        <Combobox
          label={t("filter.rfidCategory", "RFID Category")}
          options={rfidCategoryOptions}
          placeholder={t("filter.rfidCategoryPlaceholder", "Select RFID category...")}
          value={rfidCategory}
          onSelect={setRfidCategory}
        />
        <Combobox
          label={t("filter.rfidType", "RFID Type")}
          options={rfidTypeOptions}
          placeholder={t("filter.rfidTypePlaceholder", "Select RFID type...")}
          value={rfidType}
          onSelect={setRfidType}
        />
        <MultiCombobox
          disabled={isLoadingStockMovementTypes}
          emptyMessage={t(
            "filter.noStockMovementTypes",
            "No stock movement types available",
          )}
          label={t("filter.stockMovementTypes", "Stock Movement Types")}
          options={stockMovementTypeMultiOptions}
          placeholder={
            isLoadingStockMovementTypes
              ? t("loading", "Loading...")
              : t("filter.stockMovementTypesPlaceholder", "Select stock movement types...")
          }
          selectedValues={stockMovementTypeIds}
          onValueChange={setStockMovementTypeIds}
        />
      </div>
      <div className="border-t bg-background p-4">
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onReset}>
            {t("filter.reset", "Reset")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t("filter.cancel", "Cancel")}
            </Button>
            <Button onClick={onApply}>{t("filter.apply", "Apply")}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LaminaOutboundLogFilterContent;
