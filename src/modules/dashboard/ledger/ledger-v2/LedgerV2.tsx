"use client";

import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnumLedgerStatus, LedgerItemType } from "@/types/ledger";
import { RfidType } from "@/types/rfid";

import LedgerHeader from "../LedgerHeader";
import LedgerItem from "../LedgerItemV2";
import LedgerModalAddLedgerV2 from "../LedgerModalAddLedgerV2";
import LedgerModalAddReusableEpcV2 from "../LedgerModalAddReusableEpcV2";
import PrintModalV5 from "../PrintModalV5";
import { LedgerProviderV2, useLedgerV2 } from "./useLedgerV2";

interface LedgerV2Props {
  visibleTabs?: EnumLedgerStatus[];
  epcType?: RfidType;
  initialStatus?: EnumLedgerStatus;
}

const LedgerV2Content = ({
  visibleTabs,
}: {
  visibleTabs?: EnumLedgerStatus[];
}) => {
  const { t } = useTranslation("ledger");
  const {
    areAllItemsSelected,
    clearSelectedItems,
    epcType,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    isPrintingMode,
    itemsPerPage,
    ledgerData,
    isLoading,
    selectAllItems,
    selectedItems,
    selectedStatus,
    setFilters,
    setItemsPerPage,
    setSelectedStatus,
    toggleItemSelection,
  } = useLedgerV2();

  const [showPrintModal, setShowPrintModal] = useState(false);

  const tableHeader = useMemo(
    () => [
      t("table.header.id"),
      t("table.header.sku"),
      t("table.header.internalCode"),
      t("table.header.type"),
      t("table.header.unitPrint"),
      t("table.header.status"),
      t("table.header.lastUpdated"),
      t("table.header.amountItem"),

      t("table.header.action"),
    ],
    [t]
  );

  const handlePrintItems = () => {
    if (selectedItems.length > 0) {
      setShowPrintModal(true);
    }
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status as EnumLedgerStatus);
  };
  return (
    <div className="flex w-full gap-4 flex-col">
      {/* Status Filter Tabs */}
      {/* Status Filter Tabs - Only show if multiple tabs are visible */}
      {(!visibleTabs || visibleTabs.length > 1) && (
        <Tabs
          className="w-full mt-4"
          value={selectedStatus}
          onValueChange={handleStatusFilter}
        >
          <TabsList
            className={`grid w-full ${!visibleTabs || (visibleTabs.includes(EnumLedgerStatus.WAITING_PRINT) && visibleTabs.includes(EnumLedgerStatus.WAITING_INBOUND)) ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {(!visibleTabs ||
              visibleTabs.includes(EnumLedgerStatus.WAITING_PRINT)) && (
              <TabsTrigger
                className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
                value={EnumLedgerStatus.WAITING_PRINT}
              >
                Waiting Print
              </TabsTrigger>
            )}
            {(!visibleTabs ||
              visibleTabs.includes(EnumLedgerStatus.WAITING_INBOUND)) && (
              <TabsTrigger
                className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
                value={EnumLedgerStatus.WAITING_INBOUND}
              >
                Waiting Inbound
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      )}

      <div className="flex flex-row w-full justify-between items-center gap-4">
        {isPrintingMode ? (
          <div className="flex gap-2">
            <Button
              disabled={selectedItems.length === 0}
              size={"sm"}
              variant={"default"}
              onClick={handlePrintItems}
            >
              {t("buttons.printSelected", { count: selectedItems.length })}
            </Button>
            <Button
              disabled={areAllItemsSelected()}
              size={"sm"}
              variant={"outline"}
              onClick={() => selectAllItems(!areAllItemsSelected())}
            >
              {t("buttons.selectAll")}
            </Button>
          </div>
        ) : (
          <div />
        )}
        <LedgerHeader
          clearSelectedItems={clearSelectedItems}
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          isReusableEpc={epcType === RfidType.REUSABLE}
          itemsPerPage={itemsPerPage}
          selectedItems={selectedItems}
          setItemsPerPage={setItemsPerPage}
          onApplyFilters={setFilters}
        />
      </div>

      {isLoading ? (
        <SkeletonTable columns={9} />
      ) : ledgerData.length === 0 ? (
        <EmptyState
          action={
            epcType === RfidType.REUSABLE ? (
              <LedgerModalAddReusableEpcV2 />
            ) : (
              <LedgerModalAddLedgerV2 />
            )
          }
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {isPrintingMode && (
                  <TableHead>
                    <Checkbox
                      checked={areAllItemsSelected()}
                      className="border-black"
                      onCheckedChange={(checked) => selectAllItems(!!checked)}
                    />
                  </TableHead>
                )}
                {tableHeader.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerData.map((item) => (
                <LedgerItem
                  key={item.id}
                  isSelected={
                    isPrintingMode
                      ? item.new_item_status_histories?.some((history) =>
                          selectedItems.some(
                            (selectedItem) =>
                              selectedItem.id === history.item.id
                          )
                        )
                      : false // For now, we'll handle delete without pre-selection
                  }
                  item={item}
                  showCheckbox={isPrintingMode}
                  onSelect={
                    isPrintingMode
                      ? (item, isSelected) => {
                          // For LEDGER_PACKING, only take the first item (index 0)
                          // For regular LEDGER, take all items
                          const statusHistoriesToProcess =
                            item.stock_movement_type.name === "LEDGER_PACKING"
                              ? item.new_item_status_histories?.slice(0, 1) ||
                                []
                              : item.new_item_status_histories || [];

                          statusHistoriesToProcess.forEach((statusItem) => {
                            // Use type assertion to handle type incompatibility
                            // Preserve stock movement type information for print context
                            const ledgerItemWithPackingInfo = {
                              ...(statusItem.item as unknown as LedgerItemType),
                              _isPackingType:
                                item.stock_movement_type.name ===
                                "LEDGER_PACKING",
                              _ledgerId: item.id,
                              // Add all packing items for LEDGER_PACKING type
                              ...(item.stock_movement_type.name ===
                                "LEDGER_PACKING" && {
                                _packingItems: (
                                  item.new_item_status_histories || []
                                ).map(
                                  (historyItem) =>
                                    historyItem.item as unknown as LedgerItemType
                                ),
                              }),
                              _stockMovementType: item.stock_movement_type,
                            };
                            toggleItemSelection(
                              ledgerItemWithPackingInfo,
                              isSelected,
                              item.created_at
                            );
                          });
                        }
                      : undefined
                  }
                />
              ))}
            </TableBody>
          </Table>
          {/* <div className="flex flex-row flex-1 justify-end items-end w-full">
            <PaginationCursor
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onNext={goToNextPage}
              onPrev={goToPrevPage}
            />
          </div> */}
        </div>
      )}

      {showPrintModal && isPrintingMode && (
        <PrintModalV5
          items={selectedItems}
          onClose={() => {
            setShowPrintModal(false);
            clearSelectedItems();
          }}
        />
      )}
    </div>
  );
};

const LedgerV2 = ({ visibleTabs, epcType, initialStatus }: LedgerV2Props) => {
  return (
    <LedgerProviderV2 epcType={epcType} initialStatus={initialStatus}>
      <LedgerV2Content visibleTabs={visibleTabs} />
    </LedgerProviderV2>
  );
};

export default LedgerV2;
