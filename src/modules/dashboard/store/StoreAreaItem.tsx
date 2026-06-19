import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteStoreAreaDataMutation from "@/hooks/api/store/useDeleteStoreAreaDataMutation";
import { KEY_USE_GET_STORE_AREA_DATA } from "@/hooks/api/store/useGetStoreAreaDataQuery";
import { toastError } from "@/services";
import { StoreAreaItemType } from "@/types/store";

import StoreAreaModalAdd from "./StoreAreaModalAdd";

interface StoreAreaItemProps {
  item: StoreAreaItemType;
  num?: number;
  storeId: string;
}

const StoreAreaItem: React.FC<StoreAreaItemProps> = ({
  item,
  num,
  storeId,
}) => {
  const { t } = useTranslation(["store"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const queryClient = useQueryClient();
  const { mutateAsync: deleteArea } = useDeleteStoreAreaDataMutation();

  const handleDelete = async () => {
    try {
      await deleteArea({
        areaId: item.id,
        organizationId,
        storeId: storeId,
      });

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STORE_AREA_DATA(organizationId, storeId),
      });

      toast.success(t("store:toast.areaDeleted"));
    } catch (error) {
      toastError(error as Error);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell className="flex gap-2">
        <StoreAreaModalAdd
          areaData={item}
          areaId={item.id}
          storeId={storeId}
          type="edit"
        />
        <ButtonDelete onSubmit={handleDelete} />
      </TableCell>
    </TableRow>
  );
};

export default StoreAreaItem;
