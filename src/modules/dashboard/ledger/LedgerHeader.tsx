"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LoaderIcon, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useDeleteStockMovementMutation from "@/hooks/api/stockMovement/useDeleteStockMovementMutation";
import { KEY_USE_GET_STOCK_MOVEMENT_DATA } from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { LedgerFilter, LedgerItemType } from "@/types/ledger";

import LedgerV2Filter from "./ledger-v2/LedgerV2Filter";
import LedgerModalAddLedgerV2 from "./LedgerModalAddLedgerV2";
import LedgerModalAddReusableEpcV2 from "./LedgerModalAddReusableEpcV2";
interface LedgerItemWithPackingInfo extends LedgerItemType {
  _isPackingType?: boolean;
  _ledgerId?: string;
  _packingItems?: LedgerItemType[];
  _stockMovementType?: {
    name: string;
  };
}
interface LedgerHeaderProps {
  clearSelectedItems?: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isReusableEpc?: boolean;
  itemsPerPage: number;
  onApplyFilters?: (filters: LedgerFilter) => void;
  selectedItems?: LedgerItemWithPackingInfo[];
  setItemsPerPage: (limit: number) => void;
}

const LedgerHeader = ({
  clearSelectedItems,
  goToNextPage,
  goToPrevPage,
  hasNextPage,
  hasPrevPage,
  isReusableEpc = false,
  itemsPerPage,
  onApplyFilters,
  selectedItems = [],
  setItemsPerPage,
}: LedgerHeaderProps) => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();
  const { canCreate, canDelete } = usePermissions();
  const { mutateAsync: deleteStockMovement } = useDeleteStockMovementMutation({
    onSuccess: async () => {},
  });
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

  const handleBulkDelete = async () => {
    if (
      !tokenPayload?.organization_id ||
      !selectedTeam ||
      selectedItems.length === 0
    ) {
      return;
    }

    setIsDeletingInProgress(true);

    try {
      // Group items by their stock movement ID
      const groupedItems = selectedItems.reduce(
        (acc, item) => {
          const stockMovementId = item._ledgerId ?? 0;
          if (!acc[stockMovementId]) {
            acc[stockMovementId] = [];
          }
          if (item._isPackingType) {
            item._packingItems?.forEach((packingItem) => {
              acc[stockMovementId].push(packingItem.id);
            });
          } else {
            acc[stockMovementId].push(item.id);
          }
          return acc;
        },
        {} as Record<string, string[]>
      );
      // Delete each group of items
      const deletePromises = Object.entries(groupedItems).map(
        ([stockMovementId, itemIds]) => {
          return deleteStockMovement({
            itemIds,
            organizationId: tokenPayload.organization_id,
            stockMovementId,
            storeId: selectedTeam,
          });
        }
      );

      await Promise.all(deletePromises);

      toast.success(`All ${selectedItems.length} items deleted successfully`);
      await queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_DATA(
          tokenPayload?.organization_id,
          selectedTeam,
          {}
        ),
      });
      // Clear selection after successful deletion
      clearSelectedItems?.();
    } catch (error) {
      console.error(`Failed to delete stock movement `, error);
      toast.error("Failed to delete one or more items");
    } finally {
      setIsDeletingInProgress(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Original single ledger buttons
        {isReusableEpc ? (
          <LedgerModalAddReusableEpc />
        ) : (
          <LedgerModalAddLedger />
        )} */}

        {/* V2 multi-ledger buttons */}
        {canCreate && (isReusableEpc ? (
          <LedgerModalAddReusableEpcV2 />
        ) : (
          <LedgerModalAddLedgerV2 />
        ))}

        {canDelete && (
          <Button
            disabled={selectedItems.length === 0 || isDeletingInProgress}
            size={"sm"}
            variant={"destructive"}
            onClick={handleBulkDelete}
          >
            {isDeletingInProgress ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <Trash2 className=" h-4 w-4" />
            )}
            {t("buttons.deleteSelected", { count: selectedItems.length })}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onApplyFilters && <LedgerV2Filter onApply={onApplyFilters} />}
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 </SelectItem>
            <SelectItem value="20">20 </SelectItem>
            <SelectItem value="50">50 </SelectItem>
            <SelectItem value="100">100 </SelectItem>
            <SelectItem value="200">200 </SelectItem>
            <SelectItem value="500">500 </SelectItem>
            <SelectItem value="1000">1000 </SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </div>
    </div>
  );
};

export default LedgerHeader;
