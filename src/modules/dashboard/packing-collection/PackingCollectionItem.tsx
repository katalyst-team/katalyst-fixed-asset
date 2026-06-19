import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeletePackingCollectionDataMutation from "@/hooks/api/packing-collection/useDeletePackingCollectionDataMutation";
import { KEY_USE_GET_PACKING_COLLECTION_DATA } from "@/hooks/api/packing-collection/useGetPackingCollectionDataQuery";
import { toastError } from "@/services";
import { PackingCollectionItemType } from "@/types/packing-collection";

import PackingCollectionModalAdd from "./PackingCollectionModalAdd";
import { usePackingCollectionStore } from "./store";

interface PackingCollectionItemProps {
  item: PackingCollectionItemType;
  num?: number;
}

const PackingCollectionItem: React.FC<PackingCollectionItemProps> = ({
  item,
  num,
}) => {
  const { t } = useTranslation(["packing-collection"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { setFilters, resetPagination } = usePackingCollectionStore();

  const { mutateAsync: deletePackingCollectionData } =
    useDeletePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  const handleDelete = async () => {
    try {
      await deletePackingCollectionData({ packingCollectionId: item.id });

      // Reset filters and pagination
      setFilters({});
      resetPagination();

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
          tokenPayload?.organization_id || "",
          undefined
        ),
      });

      toast.success(t("delete.success"));
    } catch (error) {
      toastError(error as Error);
    }
  };

  const itemCount = item.packing_items?.length || 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{num}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell className="max-w-xs truncate" title={item.description}>
        {item.description}
      </TableCell>
      <TableCell>
        {itemCount} {itemCount === 1 ? t("table.item") : t("table.items")}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <ButtonDetail href={`/dashboard/packing-collection/${item.id}`} />
          <PackingCollectionModalAdd item={item} type="edit" />
          <ButtonDelete onSubmit={handleDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PackingCollectionItem;
