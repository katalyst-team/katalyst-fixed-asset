"use client";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { AttributeCollectionItemType } from "@/types/attributeCollection";

import AttributeCollectionModalAdd from "./AttributeCollectionModalAdd";
import { useAttributeCollection } from "./useAttributeCollection";

interface AttributeCollectionItemProps {
  item: AttributeCollectionItemType;
  num: number;
}

const AttributeCollectionItem = ({
  item,
  num,
}: AttributeCollectionItemProps) => {
  const { tokenPayload } = useUser();
  const { deleteAttributeCollection } = useAttributeCollection();

  const handleDelete = async () => {
    try {
      await deleteAttributeCollection({
        attributeCollectionId: item.id,
        organizationId: tokenPayload?.organization_id || "",
      });
    } catch (error) {
      console.error("Error deleting attribute collection", error);
    }
  };

  return (
    <TableRow>
      <TableCell>{num}</TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell>{item.attribute_items?.length ?? 0}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <AttributeCollectionModalAdd
            collectionId={item.id}
            item={item}
            type="edit"
          />
          <ButtonDelete onSubmit={handleDelete} />
          <ButtonDetail href={`/dashboard/attribute/collection/${item.id}`} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AttributeCollectionItem;
