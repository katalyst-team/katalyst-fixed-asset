"use client";

import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import useCreateItemsRfidMutation from "@/hooks/api/item/useCreateItemsRfidMutation";
import { useGetItemsMapQuery } from "@/hooks/api/item/useGetItemsMapQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { ActionType } from "@/types/addRemoveRfid";
import { RfidCategory } from "@/types/rfid";

import { ActionTypeSelector } from "./components/ActionTypeSelector";
import { ConfirmationDialog } from "./components/ConfirmationDialog";
import { ItemsTable } from "./components/ItemsTable";
import { RfidSelectionDialog } from "./components/RfidSelectionDialog";
import { SearchFilterSection } from "./components/SearchFilterSection";
import { StoreSelectionSection } from "./components/StoreSelectionSection";
import { useAddRemoveRfidStore } from "./store";

interface SelectedItemMapping {
  epc: string;
  itemIds: string[];
  rfidCategory: RfidCategory;
  rfidId: string;
  rfidName: string | null;
}

const AddRemoveRfidPage = () => {
  const { t } = useTranslation("add-remove-rfid");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const {
    currentPage,
    filters,
    hasNextPage,
    hasPrevPage,
    nextCursor,
    prevCursor,
    setActionType,
    setCurrentPage,
    setFilters,
    setHasNextPage,
    setHasPrevPage,
    setItemCount,
    setNextCursor,
    setPrevCursor,
    setSearchQuery,
    setSelectedStoreId,
    setTotalCount,
    totalCount,
  } = useAddRemoveRfidStore(
    useShallow((state) => ({
      currentPage: state.currentPage,
      filters: state.filters,
      hasNextPage: state.hasNextPage,
      hasPrevPage: state.hasPrevPage,
      nextCursor: state.nextCursor,
      prevCursor: state.prevCursor,
      setActionType: state.setActionType,
      setCurrentPage: state.setCurrentPage,
      setFilters: state.setFilters,
      setHasNextPage: state.setHasNextPage,
      setHasPrevPage: state.setHasPrevPage,
      setItemCount: state.setItemCount,
      setNextCursor: state.setNextCursor,
      setPrevCursor: state.setPrevCursor,
      setSearchQuery: state.setSearchQuery,
      setSelectedStoreId: state.setSelectedStoreId,
      setTotalCount: state.setTotalCount,
      totalCount: state.totalCount,
    }))
  );

  // Local state for selected items
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedRfidMappings, setSelectedRfidMappings] = useState<Map<string, string>>(new Map());
  const [rfidDialogOpen, setRfidDialogOpen] = useState(false);
  const [currentItemIdForRfid, setCurrentItemIdForRfid] = useState<string | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  // Get stores
  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery({
    filters: { limit: 1000 },
    organizationId,
  });

  // Build store options with "All Store" option
  const storeOptions = useMemo(() => {
    return [
      { label: t("store.allStores"), value: "0" },
      ...(storeData?.data?.stores?.map((store) => ({
        label: store.name,
        value: store.id,
      })) || []),
    ];
  }, [storeData, t]);

  // Fetch items map
  const { data: itemsMapData, isFetching: isFetchingItems } = useGetItemsMapQuery({
    enabled: Boolean(filters.selectedStoreId),
    filters: {
      cursor: filters.cursor,
      is_rfid_assigned: filters.actionType === ActionType.REMOVE,
      limit: 20,
      show_total_count: true,
      sku_name: filters.searchQuery || undefined,
    },
    organizationId,
    storeId: filters.selectedStoreId || "0",
  });

  const items = useMemo(() => itemsMapData?.data?.items || [], [itemsMapData]);

  // Update pagination state from API response
  useEffect(() => {
    if (itemsMapData?.pagination) {
      setHasNextPage(!!itemsMapData.pagination.next_cursor);
      setPrevCursor(itemsMapData.pagination.prev_cursor);
      setHasPrevPage(!!itemsMapData.pagination.prev_cursor);
      setNextCursor(itemsMapData.pagination.next_cursor);
      setItemCount(itemsMapData.pagination.count || items.length);
      setTotalCount(itemsMapData.pagination.total_count);
    }
  }, [itemsMapData, items.length, setHasNextPage, setHasPrevPage, setNextCursor, setPrevCursor, setItemCount, setTotalCount]);

  // Create mutation
  const { isPending: isSubmitting, mutateAsync: createItemsRfid } =
    useCreateItemsRfidMutation();

  // Handle action type change
  const handleActionTypeChange = useCallback(
    (newActionType: ActionType) => {
      setActionType(newActionType);
      // Clear selections when switching action type
      setSelectedItemIds([]);
      setSelectedRfidMappings(new Map());
      setCurrentPage(1);
      setFilters({ cursor: undefined });
    },
    [setActionType, setCurrentPage, setFilters]
  );

  // Handle store change
  const handleStoreChange = useCallback(
    (storeId: string) => {
      setSelectedStoreId(storeId);
      // Clear selections and pagination when store changes
      setSelectedItemIds([]);
      setSelectedRfidMappings(new Map());
      setCurrentPage(1);
      setFilters({ cursor: undefined });
    },
    [setSelectedStoreId, setCurrentPage, setFilters]
  );

  // Handle search
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Reset pagination when searching
      setCurrentPage(1);
      setFilters({ cursor: undefined });
    },
    [setSearchQuery, setCurrentPage, setFilters]
  );

  // Handle item check/uncheck
  const handleItemCheck = useCallback(
    (itemId: string) => {
      setSelectedItemIds((prev) => {
        if (prev.includes(itemId)) {
          return prev.filter((id) => id !== itemId);
        }
        return [...prev, itemId];
      });
    },
    []
  );

  // Handle RFID selection button click
  const handleRfidSelectClick = useCallback((itemId: string) => {
    setCurrentItemIdForRfid(itemId);
    setRfidDialogOpen(true);
  }, []);

  // Handle RFID selection from dialog
  const handleRfidSelected = useCallback(
    (rfidId: string, _epc: string, _rfidName: string | null, category: RfidCategory) => {
      if (currentItemIdForRfid) {
        // For SINGLE RFID, remove the RFID from any other item
        if (category === RfidCategory.SINGLE) {
          const existingItemForThisRfid = Array.from(selectedRfidMappings.entries()).find(
            ([, rfid]) => rfid === rfidId
          );

          if (existingItemForThisRfid) {
            toast.error(t("messages.singleRfidLimit"));
            return;
          }

          // Remove this item's previous RFID selection
          setSelectedRfidMappings((prev) => {
            const newMap = new Map(prev);
            newMap.delete(currentItemIdForRfid);
            return newMap;
          });
        }

        // Set the RFID for this item
        setSelectedRfidMappings((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentItemIdForRfid, rfidId);
          return newMap;
        });

        // Auto-check the item
        setSelectedItemIds((prev) => {
          if (!prev.includes(currentItemIdForRfid)) {
            return [...prev, currentItemIdForRfid];
          }
          return prev;
        });
      }
    },
    [currentItemIdForRfid, selectedRfidMappings, t]
  );

  // Handle pagination
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      setCurrentPage(currentPage + 1);
      setFilters({ cursor: nextCursor });
    }
  }, [currentPage, nextCursor, setFilters, setCurrentPage]);

  const handlePrevPage = useCallback(() => {
    if (prevCursor) {
      setCurrentPage(Math.max(1, currentPage - 1));
      setFilters({ cursor: prevCursor });
    }
  }, [currentPage, prevCursor, setFilters, setCurrentPage]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      let itemsPayload: Array<{ item_ids: string[]; epc: string }>;

      if (filters.actionType === ActionType.ADD) {
        // For ADD: use the selected RFID mapping
        itemsPayload = Array.from(selectedRfidMappings.entries()).map(
          ([itemId, rfidId]) => ({
            epc: rfidId,
            item_ids: [itemId],
          })
        );
      } else {
        // For REMOVE: get the epc from the item's existing rfid_detail
        itemsPayload = selectedItemIds
          .map((itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (!item?.rfid_detail?.epc) {
              return null;
            }
            return {
              epc: item.rfid_detail.epc,
              item_ids: [itemId],
            };
          })
          .filter((payload): payload is { item_ids: string[]; epc: string } => payload !== null);
      }

      await createItemsRfid({
        data: {
          action: filters.actionType,
          items: itemsPayload,
        },
        organizationId,
        storeId: filters.selectedStoreId,
      });

      // Reset form
      setSelectedItemIds([]);
      setSelectedRfidMappings(new Map());
      setConfirmationDialogOpen(false);
      toast.success(t("messages.success"));
    } catch {
      toast.error(t("messages.error"));
    }
  }, [
    selectedRfidMappings,
    selectedItemIds,
    items,
    filters.actionType,
    filters.selectedStoreId,
    organizationId,
    createItemsRfid,
    setConfirmationDialogOpen,
    t,
  ]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      filters.selectedStoreId !== "" &&
      selectedItemIds.length > 0 &&
      (filters.actionType === ActionType.REMOVE || selectedRfidMappings.size > 0)
    );
  }, [filters, selectedItemIds, selectedRfidMappings]);

  // Build rfid mappings for confirmation dialog
  const confirmationMappings = useMemo(() => {
    const uniqueRfids = new Map<string, SelectedItemMapping>();

    Array.from(selectedRfidMappings.entries()).forEach(([itemId, rfidId]) => {
      const rfidItem = items.find((i) => i.rfid_detail?.id === rfidId || i.id === rfidId);

      if (!uniqueRfids.has(rfidId)) {
        uniqueRfids.set(rfidId, {
          epc: rfidItem?.rfid_detail?.epc || rfidId,
          itemIds: [],
          rfidCategory: rfidItem?.rfid_detail?.category || RfidCategory.SINGLE,
          rfidId,
          rfidName: rfidItem?.rfid_detail?.name || null,
        });
      }

      const mapping = uniqueRfids.get(rfidId);
      if (mapping) {
        mapping.itemIds.push(itemId);
      }
    });

    return Array.from(uniqueRfids.values());
  }, [selectedRfidMappings, items]);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Store Selection */}
          <StoreSelectionSection
            isLoading={isLoadingStores}
            selectedStoreId={filters.selectedStoreId}
            setSelectedStoreId={handleStoreChange}
            storeOptions={storeOptions}
          />

          {/* Action Type Selector */}
          <ActionTypeSelector
            actionType={filters.actionType}
            setActionType={handleActionTypeChange}
          />

          {/* Search Filter */}
          <SearchFilterSection
            disabled={!filters.selectedStoreId}
            searchQuery={filters.searchQuery}
            setSearchQuery={handleSearchChange}
          />

          {/* Items Table */}
          <ItemsTable
            actionType={filters.actionType}
            isLoading={isFetchingItems}
            items={items}
            selectedItemIds={selectedItemIds}
            selectedRfidMappings={selectedRfidMappings}
            onItemCheck={handleItemCheck}
            onRfidSelect={handleRfidSelectClick}
          />

          {/* Pagination */}
          <div className="flex justify-end">
            <PaginationCursor
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              limit={20}
              totalCount={totalCount}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedItemIds.length > 0 && (
                <span>
                  {t("selectedItems", "Selected: {{count}} item(s)", {
                    count: selectedItemIds.length,
                  })}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItemIds([]);
                  setSelectedRfidMappings(new Map());
                }}
              >
                {t("buttons.reset")}
              </Button>
              <Button
                disabled={!isFormValid || isSubmitting}
                onClick={() => setConfirmationDialogOpen(true)}
              >
                {isSubmitting ? t("common:loading") : t("buttons.submit")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RFID Selection Dialog */}
      <RfidSelectionDialog
        isOpen={rfidDialogOpen}
        organizationId={organizationId}
        onClose={() => setRfidDialogOpen(false)}
        onConfirm={handleRfidSelected}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        actionType={filters.actionType}
        isOpen={confirmationDialogOpen}
        itemCount={selectedItemIds.length}
        rfidMappings={confirmationMappings}
        onClose={() => setConfirmationDialogOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
};

export default AddRemoveRfidPage;
