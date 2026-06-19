import Image from "next/image";
import { useTranslation } from "next-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionType } from "@/types/addRemoveRfid";

import { RfidSelectorButton } from "./RfidSelectorButton";

interface Item {
  id: string;
  rfid_detail: {
    epc: string;
    name: string | null;
    category: string;
  } | null;
  sku: {
    internal_code: string;
    name: string;
    image_urls: string[];
  };
}

interface ItemRowProps {
  actionType: ActionType;
  isChecked: boolean;
  item: Item;
  onCheck: (itemId: string) => void;
  onRfidSelect: (itemId: string) => void;
  selectedRfidMapping: string | undefined;
}

function ItemRow({
  actionType,
  isChecked,
  item,
  onCheck,
  onRfidSelect,
  selectedRfidMapping,
}: ItemRowProps) {
  const { t } = useTranslation("add-remove-rfid");

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onCheck(item.id)}
        />
      </TableCell>
      <TableCell>{item.sku.internal_code}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {item.sku.image_urls?.[0] && (
            <Image
              alt={item.sku.name}
              className="h-8 w-8 rounded object-cover"
              height={32}
              src={item.sku.image_urls[0]}
              width={32}
            />
          )}
          <span>{item.sku.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {actionType === ActionType.REMOVE ? (
          item.rfid_detail?.epc || t("table.noRfidAssigned")
        ) : (
          <RfidSelectorButton
            selectedRfidMapping={selectedRfidMapping}
            onClick={() => onRfidSelect(item.id)}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

interface ItemsTableProps {
  actionType: ActionType;
  isLoading?: boolean;
  items: Item[];
  selectedItemIds: string[];
  selectedRfidMappings: Map<string, string>; // itemId -> rfidId
  onItemCheck: (itemId: string) => void;
  onRfidSelect: (itemId: string) => void;
}

export function ItemsTable({
  actionType,
  isLoading = false,
  items,
  onItemCheck,
  onRfidSelect,
  selectedItemIds,
  selectedRfidMappings,
}: ItemsTableProps) {
  const { t } = useTranslation("add-remove-rfid");

  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selectedItemIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      items.forEach((item) => onItemCheck(item.id));
    } else {
      // Select all
      items.forEach((item) => {
        if (!selectedItemIds.includes(item.id)) {
          onItemCheck(item.id);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground">{t("common:loading")}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{t("table.noData")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>{t("table.header.sku")}</TableHead>
            <TableHead>{t("table.header.name")}</TableHead>
            <TableHead>{t("table.header.rfid")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              actionType={actionType}
              isChecked={selectedItemIds.includes(item.id)}
              item={item}
              selectedRfidMapping={selectedRfidMappings.get(item.id)}
              onCheck={onItemCheck}
              onRfidSelect={onRfidSelect}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
