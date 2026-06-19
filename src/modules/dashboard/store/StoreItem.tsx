import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteStoreDataMutation from "@/hooks/api/store/useDeleteStoreDataMutation";
import { KEY_USE_GET_STORE_DATA } from "@/hooks/api/store/useGetStoreDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { StoreItemType } from "@/types/store";

import StoreModalAddStore from "./StoreModalAddStore";

interface StoreItemProps {
  item: StoreItemType;
  num?: number;
}

const StoreItem: React.FC<StoreItemProps> = ({ item, num }) => {
  const { t } = useTranslation(["store"]);
  const { tokenPayload } = useUser();
  const { mutateAsync: deleteStore } = useDeleteStoreDataMutation();
  const queryClient = useQueryClient();
  const { canDelete, canUpdate } = usePermissions();

  const handleDelete = async () => {
    deleteStore({
      organizationID: tokenPayload?.organization_id || "",
      storeID: item.id,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_STORE_DATA(tokenPayload?.organization_id || ""),
        });
        toast.success(t("store:toast.storeDeleted"));
      })
      .catch((e) => toastError(e));
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.address}</TableCell>
      <TableCell>
        <Badge variant={item.status === "ACTIVE" ? "default" : "destructive"}>
          {item.status === "ACTIVE"
            ? t("store:table.status.active")
            : t("store:table.status.inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {canUpdate && <StoreModalAddStore storeData={item} storeId={item.id} type="edit" />}
          {canDelete && <ButtonDelete onSubmit={handleDelete} />}
          <ButtonDetail href={`/dashboard/store/${item.id}`} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default StoreItem;
