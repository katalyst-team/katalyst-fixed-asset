import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import BarcodeDisplay from "@/components/shared/BarcodeDisplay";
import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { RfidItemType } from "@/types/rfid";

import EpcModalAdd from "./EpcModalAdd";
import { useEpcActions } from "./useEpcActions";

interface EpcItemProps {
  item: RfidItemType;
  num?: number;
}

const EpcItem: React.FC<EpcItemProps> = ({ item, num }) => {
  const { t } = useTranslation(["epc"]);
  const { deleteEpc } = useEpcActions();
  const { canDelete, canUpdate } = usePermissions();

  const handleDelete = async () => {
    try {
      await deleteEpc({ ids: [item.id] });
      toast.success(t("delete.success"));
    } catch (error) {
      toastError(error as Error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return "outline";
      case "DISPOSABLE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "SINGLE":
        return "outline";
      case "PACKAGE":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return t("status.active");
      case "INACTIVE":
        return t("status.inactive");
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("type.reusable");
      case "DISPOSABLE":
        return t("type.disposable");
      default:
        return type;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("category.single");
      case "PACKAGE":
        return t("category.package");
      default:
        return category;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num}</TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="font-mono text-sm">{item.epc}</TableCell>
      <TableCell>
        <BarcodeDisplay value={item.epc} />
      </TableCell>
      <TableCell>
        <Badge variant={getTypeBadgeVariant(item.type)}>
          {getTypeText(item.type)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getCategoryBadgeVariant(item.category)}>
          {getCategoryText(item.category)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(item.status)}>
          {getStatusText(item.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_used ? "default" : "secondary"}>
          {item.is_used ? t("isUsed.yes") : t("isUsed.no")}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{item.cycle_count ?? 0}</TableCell>
      <TableCell className="text-sm">
        {item.store?.name || "-"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(item.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <ButtonDetail href={`/dashboard/epc/${item.id}`} />
          {canUpdate && <EpcModalAdd epcData={item} type="edit" />}
          {canDelete && <ButtonDelete onSubmit={handleDelete} />}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EpcItem;
