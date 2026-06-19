import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteEdgeConfigMutation from "@/hooks/api/edge-config/useDeleteEdgeConfigMutation";
import { toastError } from "@/services";
import {
  EdgeConfigItemType,
  EdgeConfigRfidTagStatus,
} from "@/types/edge-config";
import { convertToTitleCase } from "@/utils/text";

import EdgeConfigModal from "./EdgeConfigModal";

interface EdgeConfigItemProps {
  item: EdgeConfigItemType;
  num?: number;
}

const EdgeConfigItem = ({ item, num }: EdgeConfigItemProps) => {
  const { t } = useTranslation(["edge-config"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const deleteMutation = useDeleteEdgeConfigMutation({ organizationId });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ ids: [item.id] });
      toast.success(t("delete.success"));
    } catch (error) {
      toastError(error as Error);
    }
  };

  const getRfidStatusBadgeVariant = (status: string | null) => {
    if (!status) return "secondary";
    switch (status) {
      case EdgeConfigRfidTagStatus.ACTIVE:
        return "default";
      case EdgeConfigRfidTagStatus.INACTIVE:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRfidStatusText = (status: string | null) => {
    if (!status) return "-";
    switch (status) {
      case EdgeConfigRfidTagStatus.ACTIVE:
        return t("status.active");
      case EdgeConfigRfidTagStatus.INACTIVE:
        return t("status.inactive");
      default:
        return status;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num}</TableCell>
      <TableCell className="font-medium">{item.name || "Untitled"}</TableCell>
      <TableCell>{item.store_name || "-"}</TableCell>
      <TableCell>{item.antenna ?? "-"}</TableCell>
      <TableCell className="font-mono text-xs">{item.device_id || "-"}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {convertToTitleCase(item.current_stock_movement_type.name)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {convertToTitleCase(item.next_stock_movement_type.name)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getRfidStatusBadgeVariant(item.rfid_tag_status)}>
          {getRfidStatusText(item.rfid_tag_status)}
        </Badge>
      </TableCell>
      <TableCell>{item.operator_account_name ?? "-"}</TableCell>
      <TableCell>
        {item.parent_category_ids?.length ? (
          <Badge variant="outline">{item.parent_category_ids.length} {item.parent_category_ids.length === 1 ? "category" : "categories"}</Badge>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <EdgeConfigModal edgeConfigData={item} type="edit" />
          <ButtonDelete onSubmit={handleDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EdgeConfigItem;
