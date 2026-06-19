import { format, parseISO } from "date-fns";
import { Printer } from "lucide-react";
import { useTranslation } from "next-i18next";
import { v4 as uuidv4 } from "uuid";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import ButtonDialog from "@/components/shared/ButtonDialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useAssignRfidItemMutation from "@/hooks/api/ledger/useAssignRfidItemMutation";
import useDeleteLedgerItemMutation from "@/hooks/api/ledger/useDeleteLedgerItemMutation";
import useUpdateLedgerItemMutation from "@/hooks/api/ledger/useUpdateLedgerItemMutation";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import {
  EnumEpcHardcode,
  EnumLedgerStatus,
  LedgerItemType,
} from "@/types/ledger";
import { convertToTitleCase } from "@/utils/text";

// Use uuidv4 for ID generation
export const generateRandomId = (): string => {
  return uuidv4();
};

interface LedgerItemProps {
  item: LedgerItemType;
  isSelected: boolean;
  onSelect: (item: LedgerItemType, isSelected: boolean) => void;
}

const LedgerItem: React.FC<LedgerItemProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const { mutate: deleteLedgerItem } = useDeleteLedgerItemMutation();
  const { canDelete } = usePermissions();
  const { mutateAsync: updateLedgerItem } = useUpdateLedgerItemMutation();
  const { mutateAsync: assignRfidItem } = useAssignRfidItemMutation();
  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click event
    onSelect(item, !isSelected);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "HH:mm:ss dd/MM/yyyy");
    } catch {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <TableRow>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          className="border-black"
          onClick={handleCheckboxClick}
        />
      </TableCell>
      <TableCell className="font-medium">{item.sku.name}</TableCell>
      <TableCell>{item.epc ?? "N/A"} </TableCell>
      <TableCell>
        <Badge
          variant={item.status.name === "active" ? "default" : "secondary"}
        >
          {t(
            `status.${item.status.name.toLowerCase()}`,
            convertToTitleCase(item.status.name),
          )}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(item.updated_at)}</TableCell>
      <TableCell>{item.sku.categories?.[0]?.name || "-"}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          {process.env.NEXT_PUBLIC_ENV === "development" && (
            <ButtonDialog
              description="Are you sure you want to print this item?"
              icon={<Printer />}
              text_btn_cancel="Cancel"
              text_btn_continue="Print"
              title="Print Item"
              onSubmit={async () => {
                try {
                  // Step 1: Update ledger item
                  await updateLedgerItem({
                    itemId: item.id,
                    organizationId: tokenPayload?.organization_id ?? "",
                    params: {
                      epc: EnumEpcHardcode.E28068942000402FBEC4A83F,
                      sku_id: item.sku.id,
                      status_id:
                        ((statuses?.data?.statuses || []).find(
                          (status) =>
                            status.name === EnumLedgerStatus.WAITING_INBOUND,
                        )?.id as EnumLedgerStatus) ??
                        EnumLedgerStatus.SUCCESS_INBOUND,
                    },
                    storeId: selectedTeam,
                  });

                  // Step 2: Assign RFID to item
                  await assignRfidItem({
                    itemId: item.id,
                    organizationId: tokenPayload?.organization_id ?? "",
                    params: {
                      action: "ADD",
                      epc: EnumEpcHardcode.E28068942000402FBEC4A83F,
                    },
                    storeId: selectedTeam,
                  });
                } catch (error) {
                  console.error("Error in print operation:", error);
                }
              }}
            />
          )}
          {canDelete && (
            <ButtonDelete
              onSubmit={(e) => {
                e.stopPropagation();
                deleteLedgerItem({
                  itemId: item.id,
                  organizationId: tokenPayload?.organization_id ?? "",
                  storeId: selectedTeam,
                });
              }}
            />
          )}
          <ButtonDetail href={`/dashboard/ledger/${item.id}`} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LedgerItem;
