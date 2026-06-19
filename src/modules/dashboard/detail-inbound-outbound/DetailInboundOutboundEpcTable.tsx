import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import Pagination from "@/components/shared/Pagination";
import TableExportButton from "@/components/shared/TableExportButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { StockMovementEpcItemType } from "@/types/stockMovementDetail";
import { convertToTitleCase } from "@/utils/text";

import DetailInboundOutboundEpcItem from "./DetailInboundOutboundEpcItem";
import { useDetailInboundOutbound } from "./useDetailInboundOutbound";

interface DetailInboundOutboundEpcTableProps {
  skuId: string;
  skuName: string;
  epcItems: StockMovementEpcItemType[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const DetailInboundOutboundEpcTable: React.FC<
  DetailInboundOutboundEpcTableProps
> = ({
  skuId,
  skuName,
  epcItems,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const { t } = useTranslation("detail-inbound-outbound");
  const { t: commonT } = useTranslation("common");
  const { allEpcDataBySku } = useDetailInboundOutbound();
  const [expandedPackages, setExpandedPackages] = useState<Set<number>>(
    new Set(),
  );

  const togglePackageExpansion = (groupIndex: number) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedPackages(newExpanded);
  };

  const epcTableHeader = useMemo(
    () => [
      t("epcTable.header.no"),
      t("epcTable.header.epc"),
      t("epcTable.header.rfidName"),
      t("epcTable.header.category"),
      t("epcTable.header.amount"),
      t("epcTable.header.lastUpdate"),
      t("epcTable.header.status"),
      t("epcTable.header.action"),
    ],
    [t],
  );

  // Prepare export data - expand all package items
  const exportData = useMemo(() => {
    const allEpcsForSku = allEpcDataBySku[skuId] || [];
    const result: Array<{
      no: string;
      epc: string;
      rfidName: string;
      category: string;
      amount: string;
      lastUpdate: string;
      status: string;
      isPackageChild?: boolean;
    }> = [];

    const singleItems = allEpcsForSku.filter(
      (item) => item.category === "SINGLE",
    );
    const packageItems = allEpcsForSku.filter(
      (item) => item.category === "PACKAGE",
    );

    // Add single items
    singleItems.forEach((item, index) => {
      result.push({
        amount: "1",
        category: commonT("single"),
        epc: item.epc,
        lastUpdate: item.lastUpdate,
        no: String(index + 1),
        rfidName: item.rfidName || "N/A",
        status: convertToTitleCase(item.lastStatus),
      });
    });

    // Group and expand package items
    if (packageItems.length > 0) {
      const packageMap = new Map<string, StockMovementEpcItemType[]>();
      packageItems.forEach((item) => {
        const key = item.epc;
        if (!packageMap.has(key)) {
          packageMap.set(key, []);
        }
        packageMap.get(key)!.push(item);
      });

      let packageGroupNo = singleItems.length + 1;
      Array.from(packageMap.values()).forEach((packageGroup) => {
        const firstItem = packageGroup[0];
        // Add parent package row
        result.push({
          amount: String(packageGroup.length),
          category: commonT("package"),
          epc: `${commonT("package")} (${packageGroup.length} items)`,
          lastUpdate: firstItem.lastUpdate,
          no: String(packageGroupNo),
          rfidName: firstItem.rfidName || "N/A",
          status: convertToTitleCase(firstItem.lastStatus),
        });

        // Add all child items
        packageGroup.forEach((item, childIndex) => {
          result.push({
            amount: "-",
            category: "-",
            epc: item.epc,
            isPackageChild: true,
            lastUpdate: "-",
            no: `${packageGroupNo}.${childIndex + 1}`,
            rfidName: item.rfidName || "N/A",
            status: convertToTitleCase(item.lastStatus),
          });
        });

        packageGroupNo++;
      });
    }

    return result;
  }, [allEpcDataBySku, skuId, commonT]);

  // Export columns configuration (excluding action column)
  const exportColumns = useMemo(
    () => [
      { key: "no", label: t("epcTable.header.no") },
      { key: "epc", label: t("epcTable.header.epc") },
      { key: "rfidName", label: t("epcTable.header.rfidName") },
      { key: "category", label: t("epcTable.header.category") },
      { key: "amount", label: t("epcTable.header.amount") },
      { key: "lastUpdate", label: t("epcTable.header.lastUpdate") },
      { key: "status", label: t("epcTable.header.status") },
    ],
    [t],
  );

  // Group items by category and package
  const groupedItems = useMemo(() => {
    const singleItems = epcItems.filter((item) => item.category === "SINGLE");
    const packageItems = epcItems.filter((item) => item.category === "PACKAGE");

    // Group package items by EPC (since they seem to share the same EPC)
    const packageGroups: StockMovementEpcItemType[][] = [];
    if (packageItems.length > 0) {
      const packageMap = new Map<string, StockMovementEpcItemType[]>();

      packageItems.forEach((item) => {
        const key = item.epc; // Group by EPC or you might want to use another identifier
        if (!packageMap.has(key)) {
          packageMap.set(key, []);
        }
        packageMap.get(key)!.push(item);
      });

      packageGroups.push(...Array.from(packageMap.values()));
    }

    return { packageGroups, singleItems };
  }, [epcItems]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="w-full flex gap-4 flex-col">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t("epcTable.title", { skuName })}
        </h3>
        <TableExportButton
          columns={exportColumns}
          data={exportData}
          filename={`epc_list_${skuName.replace(/[^a-zA-Z0-9]/g, "_")}`}
        />
      </div>
      <Table className="border shadow-md rounded-md">
        <TableHeader>
          <TableRow>
            {epcTableHeader.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {epcItems.length > 0 ? (
            <>
              {/* Render single items normally */}
              {groupedItems.singleItems.map((item, index) => (
                <DetailInboundOutboundEpcItem
                  key={item.epc}
                  item={item}
                  qty={1}
                  rowNumber={index + 1}
                />
              ))}

              {/* Render package groups with accordion */}
              {groupedItems.packageGroups.map((packageGroup, groupIndex) => {
                const firstItem = packageGroup[0];
                const rowNumber =
                  groupedItems.singleItems.length + groupIndex + 1;

                return (
                  <>
                    <PackageGroupRow
                      key={`package-group-${groupIndex}`}
                      commonT={commonT}
                      firstItem={firstItem}
                      groupIndex={groupIndex}
                      isExpanded={expandedPackages.has(groupIndex)}
                      packageGroup={packageGroup}
                      rowNumber={rowNumber}
                      onToggleExpansion={() =>
                        togglePackageExpansion(groupIndex)
                      }
                    />
                    {expandedPackages.has(groupIndex) &&
                      packageGroup.map((item, itemIndex) => (
                        <PackageItemRow
                          key={`${item.epc}-${itemIndex}`}
                          item={item}
                          itemIndex={itemIndex}
                        />
                      ))}
                  </>
                );
              })}
            </>
          ) : (
            <TableRow>
              <TableCell
                className="text-center py-4"
                colSpan={epcTableHeader.length}
              >
                {t("noEpcData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-row flex-1 justify-end items-end w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

// Package Group Row Component
interface PackageGroupRowProps {
  firstItem: StockMovementEpcItemType;
  packageGroup: StockMovementEpcItemType[];
  rowNumber: number;
  groupIndex: number;
  commonT: (key: string) => string;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

const PackageGroupRow: React.FC<PackageGroupRowProps> = ({
  firstItem,
  packageGroup,
  rowNumber,
  commonT,
  isExpanded,
  onToggleExpansion,
}) => {
  const { BadgeComponent } = useBadgeStatus(firstItem.lastStatus, {
    translationNamespace: "detail-inbound-outbound",
  });
  // EPC detail page link (for EPC column)
  const epcDetailHref = firstItem.id ? `/dashboard/epc/${firstItem.id}` : null;

  return (
    <TableRow>
      <TableCell className="font-medium">{rowNumber}</TableCell>
      <TableCell className="font-mono">
        {epcDetailHref ? (
          <Link
            className="text-blue-600 hover:text-blue-800 hover:underline"
            href={epcDetailHref}
          >
            {commonT("package")} ({packageGroup.length} items)
          </Link>
        ) : (
          <span className="text-blue-500">
            {commonT("package")} ({packageGroup.length} items)
          </span>
        )}
      </TableCell>
      <TableCell>{firstItem.rfidName || "N/A"}</TableCell>
      <TableCell>{commonT("package")}</TableCell>
      <TableCell>{packageGroup.length}</TableCell>
      <TableCell>{firstItem.lastUpdate}</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={onToggleExpansion}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

// Package Item Row Component (for expanded items)
interface PackageItemRowProps {
  item: StockMovementEpcItemType;
  itemIndex: number;
}

const PackageItemRow: React.FC<PackageItemRowProps> = ({ item, itemIndex }) => {
  const { BadgeComponent } = useBadgeStatus(item.lastStatus, {
    translationNamespace: "detail-inbound-outbound",
  });

  // EPC detail page link (for EPC column)
  const epcDetailHref = item.id ? `/dashboard/epc/${item.id}` : null;

  // Item history page link (for action button)
  const storeId = item.storeId || "0";
  const itemHistoryHref = item.itemId
    ? `/dashboard/store/${storeId}/items/${item.itemId}`
    : null;

  return (
    <TableRow className="bg-muted/30">
      <TableCell className="font-medium text-sm text-muted-foreground pl-8">
        {itemIndex + 1}
      </TableCell>
      <TableCell className="text-sm font-mono">
        {epcDetailHref ? (
          <Link
            className="text-blue-600 hover:text-blue-800 hover:underline"
            href={epcDetailHref}
          >
            {item.epc}
          </Link>
        ) : (
          <span className="text-blue-500">{item.epc}</span>
        )}
      </TableCell>
      <TableCell>{item.rfidName || "N/A"}</TableCell>
      <TableCell>-</TableCell>
      <TableCell>-</TableCell>
      <TableCell>-</TableCell>
      <TableCell>{BadgeComponent}</TableCell>
      <TableCell>
        {itemHistoryHref ? <ButtonDetail href={itemHistoryHref} /> : "-"}
      </TableCell>
    </TableRow>
  );
};

export default DetailInboundOutboundEpcTable;
