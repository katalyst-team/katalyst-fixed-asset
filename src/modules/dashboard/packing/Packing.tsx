"use client";

import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import PaginationCursor from "@/components/shared/PaginationCursor";
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

import LedgerItem from "../ledger/LedgerItemV2";
import LedgerModalAddLedger from "../ledger/LedgerModalAddLedger";
import PrintModalV5 from "../ledger/PrintModalV5";
import PackingHeader from "./components/PackingHeader";
import { usePacking } from "./usePacking";

const Packing = () => {
  const { t } = useTranslation("packing");
  const {
    ledgerData,
    isLoading,
    selectedItems,
    toggleItemSelection,
    clearSelectedItems,
    selectAllItems,
    areAllItemsSelected,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    selectedStatus,
    setSelectedStatus,
    isPrintingMode,
  } = usePacking();

  const [showPrintModal, setShowPrintModal] = useState(false);

  const tableHeader = useMemo(
    () => [
      t("table.header.id"),
      t("table.header.sku"),
      t("table.header.status"),
      t("table.header.lastUpdated"),
      t("table.header.amount"),
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
      <Tabs
        className="w-full mt-4"
        value={selectedStatus}
        onValueChange={handleStatusFilter}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            value={EnumLedgerStatus.WAITING_PRINT}
          >
            Waiting Print
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            value={EnumLedgerStatus.WAITING_INBOUND}
          >
            Waiting Inbound
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-row w-full justify-between items-center gap-4">
        {isPrintingMode ? (
          <div className="flex gap-2">
            <Button
              disabled={selectedItems.length === 0}
              size={"sm"}
              variant={"outline"}
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
        <PackingHeader />
      </div>

      {isLoading ? (
        <SkeletonTable columns={6} rows={5} />
      ) : ledgerData.length === 0 ? (
        <EmptyState
          action={<LedgerModalAddLedger />}
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
                      : false
                  }
                  item={item}
                  showCheckbox={isPrintingMode}
                  onSelect={
                    isPrintingMode
                      ? (item, isSelected) => {
                          // Map each status history item to a ledger item and toggle selection
                          item.new_item_status_histories?.forEach(
                            (statusItem) => {
                              // Use type assertion to handle type incompatibility
                              toggleItemSelection(
                                statusItem.item as unknown as LedgerItemType,
                                isSelected,
                                item.created_at
                              );
                            }
                          );
                        }
                      : undefined
                  }
                />
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-row flex-1 justify-end items-end w-full">
            <PaginationCursor
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onNext={goToNextPage}
              onPrev={goToPrevPage}
            />
          </div>
        </div>
      )}

      {showPrintModal && isPrintingMode && (
        <PrintModalV5
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items={selectedItems as any}
          onClose={() => {
            setShowPrintModal(false);
            clearSelectedItems();
          }}
        />
      )}
    </div>
  );
};

export default Packing;
