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

import LedgerHeader from "./LedgerHeader";
import LedgerItem from "./LedgerItem";
import LedgerModalAddLedger from "./LedgerModalAddLedger";
import PrintModalV5 from "./PrintModalV5";
import { useLedger } from "./useLedger";

const Ledger = () => {
  const { t } = useTranslation("ledger");
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
  } = useLedger();

  const [showPrintModal, setShowPrintModal] = useState(false);

  const tableHeader = useMemo(
    () => [
      t("table.header.select"),
      t("table.header.sku"),
      t("table.header.epc"),
      t("table.header.status"),
      t("table.header.lastUpdated"),
      t("table.header.category"),
      t("table.header.action"),
    ],
    [t]
  );

  const handlePrintItems = () => {
    if (selectedItems.length > 0) {
      setShowPrintModal(true);
    }
  };

  return (
    <div className="flex w-full gap-4 flex-col">
      <div className="flex flex-row md:flex-row mt-4 w-full justify-between items-center gap-4">
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
            onClick={() => {
              selectAllItems(!areAllItemsSelected());
            }}
          >
            {areAllItemsSelected()
              ? t("buttons.deselectAll")
              : t("buttons.selectAll")}
          </Button>
        </div>
        <LedgerHeader
          goToNextPage={goToNextPage}
          goToPrevPage={goToPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          itemsPerPage={10}
          setItemsPerPage={() => {}}
        />
      </div>

      {isLoading ? (
        <SkeletonTable columns={7} />
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
                <TableHead>
                  <Checkbox
                    checked={areAllItemsSelected()}
                    className="border-black"
                    onCheckedChange={(checked) => selectAllItems(!!checked)}
                  />
                </TableHead>
                {tableHeader.slice(1).map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerData.map((item) => (
                <LedgerItem
                  key={item.id}
                  isSelected={selectedItems.some(
                    (selectedItem) => selectedItem.id === item.id
                  )}
                  item={item}
                  onSelect={toggleItemSelection}
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

      {showPrintModal && (
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

export default Ledger;
