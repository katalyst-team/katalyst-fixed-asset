"use client";

/* eslint-disable simple-import-sort/imports */

import { Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import Pagination from "@/components/shared/Pagination";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/user-context";
import fetcher from "@/services";
import { InventorySectionItem } from "@/types/detailInventory";
import { LedgerItemType } from "@/types/ledger";
import { RfidCategory } from "@/types/rfid";
import { formatDisplayTimestamp } from "@/utils/dateTime";

import DetailInventoryItem from "./DetailInventoryItem";
import {
    PackageGroupRow,
    PackageItemRow,
} from "./DetailInventoryPackageRows";

interface DetailInventoryAreaProps {
  area: InventorySectionItem;
  skuId?: string;
}

const DetailInventoryArea: React.FC<DetailInventoryAreaProps> = ({
  area,
  skuId,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { t: commonT } = useTranslation("common");
  const { tokenPayload, selectedTeam } = useUser();

  // State for all fetched items and pagination
  const [allItems, setAllItems] = useState<LedgerItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedPackages, setExpandedPackages] = useState<Set<number>>(
    new Set()
  );
  const itemsPerPage = 10;

  const togglePackageExpansion = (groupIndex: number) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedPackages(newExpanded);
  };

  // Function to fetch all data by following cursors
  const fetchAllItems = useCallback(async () => {
    if (!tokenPayload?.organization_id) return;

    setIsLoading(true);
    let allFetchedItems: LedgerItemType[] = [];
    let nextCursor: string | null = null;

    try {
      do {
        const filters: Record<string, string | number> = {
          limit: 100,
          sku_ids: skuId ?? "",
        };

        // Add section filter if this is for a specific area
        if (area.id) {
          filters.section_id = area.id;
        }

        if (nextCursor) {
          filters.cursor = nextCursor;
        }

        // Use store ID "0" for unassigned items (when area.name is null), otherwise use selectedTeam
        const storeId = area.name ? selectedTeam : "0";
        
        const response = await fetcher({
          method: "GET",
          params: filters,
          url: `/v1/organizations/${tokenPayload.organization_id}/stores/${storeId}/items`,
        });

        if (response.data?.items) {
          allFetchedItems = [...allFetchedItems, ...response.data.items];
        }

        nextCursor = response.pagination?.next_cursor || null;
      } while (nextCursor);

      setAllItems(allFetchedItems);
    } catch (error) {
      console.error("Error fetching all items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tokenPayload?.organization_id, selectedTeam, skuId, area.id, area.name]);

  // Fetch all items when component mounts or dependencies change
  useEffect(() => {
    if (tokenPayload?.organization_id && (selectedTeam || !area.name)) {
      fetchAllItems();
    }
  }, [fetchAllItems, tokenPayload?.organization_id, selectedTeam, area.name]);

  // Filter items based on area type and status
  const getFilteredItems = useCallback((): LedgerItemType[] => {
    if (area.name) {
      // Items with specific section and SUCCESS_INBOUND status
      return allItems.filter(
        (item) =>
          item.section?.id === area.id && item.status.name === "SUCCESS_INBOUND"
      );
    } else {
      // Unset items with WAITING_PRINT or WAITING_INBOUND status
      return allItems.filter(
        (item) =>
          !item.section.id &&
          (item.status.name === "WAITING_PRINT" ||
            item.status.name === "WAITING_INBOUND")
      );
    }
  }, [allItems, area.id, area.name]);

  // Process and merge all items
  const processedItems = useMemo(() => {
    const filteredItems = getFilteredItems();

    // Sort all items by updated_at in descending order (newest first)
    const sortedItems = [...filteredItems].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const singleItems = sortedItems.filter(
      (item) =>
        item.rfid_detail?.category === RfidCategory.SINGLE ||
        item.rfid_detail === null
    );
    const packageItems = sortedItems.filter(
      (item) => item.rfid_detail?.category === RfidCategory.PACKAGE
    );

    // Group package items by EPC
    const packageGroups: LedgerItemType[][] = [];
    if (packageItems.length > 0) {
      const packageMap = new Map<string, LedgerItemType[]>();

      packageItems.forEach((item) => {
        const key = item.epc;
        if (!packageMap.has(key)) {
          packageMap.set(key, []);
        }
        packageMap.get(key)!.push(item);
      });

      // Sort package groups by the latest updated_at of items in each group
      const sortedPackageGroups = Array.from(packageMap.values()).sort(
        (a, b) => {
          const latestA = Math.max(
            ...a.map((item) => new Date(item.updated_at).getTime())
          );
          const latestB = Math.max(
            ...b.map((item) => new Date(item.updated_at).getTime())
          );
          return latestB - latestA;
        }
      );

      packageGroups.push(...sortedPackageGroups);
    }

    // Create merged items array with type information
    const mergedItems: Array<{
      type: "single" | "package";
      item: LedgerItemType;
      packageGroup?: LedgerItemType[];
      updated_at: string;
    }> = [];

    // Add single items
    singleItems.forEach((item) => {
      mergedItems.push({
        item,
        type: "single",
        updated_at: item.updated_at,
      });
    });

    // Add package groups (use first item's updated_at for sorting)
    packageGroups.forEach((packageGroup) => {
      const latestUpdated = packageGroup.reduce(
        (latest, item) =>
          new Date(item.updated_at).getTime() > new Date(latest).getTime()
            ? item.updated_at
            : latest,
        packageGroup[0].updated_at
      );

      mergedItems.push({
        item: packageGroup[0],
        // Representative item
        packageGroup,
        type: "package",
        updated_at: latestUpdated,
      });
    });

    // Sort merged items by updated_at (newest first)
    mergedItems.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return { mergedItems, packageGroups, singleItems };
  }, [getFilteredItems]);

  const totalDisplayItems = processedItems.mergedItems.length;
  const totalPages = Math.ceil(totalDisplayItems / itemsPerPage);

  // Get paginated items for current page
  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return processedItems.mergedItems.slice(startIndex, endIndex);
  };

  const filteredItems = getFilteredItems();
  const paginatedData = getPaginatedItems();

  const tableHeader = useMemo(() => {
    const headers: Array<{ content: ReactNode; key: string }> = [
      { content: t("table.header.no"), key: "no" },
      { content: t("table.header.epc"), key: "epc" },
      { content: t("table.header.rfidName"), key: "rfidName" },
      { content: t("table.header.category"), key: "category" },
      { content: t("table.header.amount"), key: "amount" },
      {
        content: (
          <div className="flex items-center gap-1">
            {t("table.header.aging")}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={t("table.header.agingTooltip")}
                    className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    type="button"
                  >
                    <Info aria-hidden className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t("table.header.agingTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        key: "aging",
      },
      { content: t("table.header.lastUpdate"), key: "lastUpdate" },
      { content: t("table.header.lastStatus"), key: "lastStatus" },
      { content: t("table.header.action"), key: "action" },
    ];

    return headers;
  }, [t]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  if (isLoading) {
    return (
      <div className="my-6">
        <h2 className="text-xl font-semibold font-heading mb-4">
          {area.name ?? t("unsetItems")}
        </h2>
        <Loading />
      </div>
    );
  }

  // Calculate quantities for display
  const totalItems = filteredItems.length;
  const packageQty = processedItems.packageGroups.length; // Number of package groups
  const singleQty = processedItems.singleItems.length;

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">
        {area.name ?? t("unsetItems")} ({totalItems} {t("total")} items,{" "}
        {packageQty} {t("package")}, {singleQty} {t("single")})
      </h2>

      {/* Display inventory items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          className="my-6 border-dashed"
          description={t("noItemsInSection")}
          title={t("noData")}
        />
      ) : (
        <>
          <Table className="border shadow-md rounded-md">
            <TableHeader>
              <TableRow>
                {tableHeader.map(({ key, content }) => (
                  <TableHead key={key}>{content}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Render merged items (single and package) sorted by updated_at */}
              {paginatedData.map((mergedItem, index) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                if (mergedItem.type === "single") {
                  return (
                    <DetailInventoryItem
                      key={mergedItem.item.id}
                      index={index}
                      item={mergedItem.item}
                      qty={1}
                    />
                  );
                } else {
                  // Package group
                  const packageGroup = mergedItem.packageGroup!;
                  const firstItem = mergedItem.item;
                  const actualGroupIndex =
                    processedItems.packageGroups.indexOf(packageGroup);

                  // Format date for package items to use
                  const parentFormattedDate = firstItem.updated_at
                    ? formatDisplayTimestamp(firstItem.updated_at)
                    : "N/A";

                  return (
                    <>
                      <PackageGroupRow
                        key={`package-group-${actualGroupIndex}`}
                        commonT={commonT}
                        firstItem={firstItem}
                        isExpanded={expandedPackages.has(actualGroupIndex)}
                        packageGroup={packageGroup}
                        rowNumber={rowNumber}
                        onToggleExpansion={() =>
                          togglePackageExpansion(actualGroupIndex)
                        }
                      />
                      {expandedPackages.has(actualGroupIndex) &&
                        (() => {
                          // Get unique SKUs from the package group
                          const uniqueSkus = packageGroup.reduce(
                            (acc, item) => {
                              if (
                                !acc.find(
                                  (existing) => existing.sku.id === item.sku.id
                                )
                              ) {
                                acc.push(item);
                              }
                              return acc;
                            },
                            [] as LedgerItemType[]
                          );

                          return uniqueSkus.map((item, itemIndex) => (
                            <PackageItemRow
                              key={`${item.sku.id}-${itemIndex}`}
                              item={item}
                              itemIndex={itemIndex}
                              packageGroup={packageGroup}
                              parentUpdatedDate={parentFormattedDate}
                            />
                          ));
                        })()}
                    </>
                  );
                }
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex flex-row flex-1 justify-end items-end w-full mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DetailInventoryArea;
