import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonEdit from "@/components/shared/ButtonEdit";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteCategoryDataMutation from "@/hooks/api/category/useDeleteCategoryDataMutation";
import { toastError } from "@/services";
import { CategoryItemType } from "@/types/category";

import { CategoryAttributeItem } from "./CategoryAttributeSelector";
import SubCategoryModalAdd from "./SubCategoryModalAdd";

interface AttributeColumn {
  id: string;
  name: string;
}

interface SubCategoryItemProps {
  attributeColumns: AttributeColumn[];
  categoryId: string;
  item: CategoryItemType;
  num: number;
  refItemsByGroup: Record<string, { id: string; name: string }[]>;
  simplifiedEdit?: boolean;
  templateOptions?: CategoryItemType[];
}

const SubCategoryItem = ({ attributeColumns, categoryId, item, num, refItemsByGroup, simplifiedEdit, templateOptions = [] }: SubCategoryItemProps) => {
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteCategory } = useDeleteCategoryDataMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const subAttributeItems: CategoryAttributeItem[] =
    item.attribute_items?.map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    })) || [];

  const subDefaults =
    item.attribute_defaults?.map((d) => ({
      attribute_id: d.attribute.attribute.id,
      values: d.values,
    })) || [];

  const defaultsByAttrId = new Map<string, string>(
    (item.attribute_defaults ?? [])
      .map((d) => {
        const attrId = d.attribute.attribute.id;
        const attrType = d.attribute.attribute.type;
        const values = d.values;
        const resolvedValues = d.attribute.attribute.resolved_values;
        const referenceItems = d.reference_items;

        if (values.length === 0) return null;

        if (attrType === "REFERENCE_GROUP") {
          if (referenceItems && referenceItems.length > 0) {
            const refMap = new Map(referenceItems.map((item) => [item.id, item.name]));
            const displayNames = values
              .map((v: string) => refMap.get(v))
              .filter(Boolean) as string[];
            if (displayNames.length > 0) {
              return [attrId, displayNames.join(", ")];
            }
          }

          if (resolvedValues && resolvedValues.length > 0) {
            const resolvedMap = new Map(resolvedValues.map((rv: { id: string; name: string }) => [rv.id, rv.name]));
            const displayNames = values
              .map((v: string) => resolvedMap.get(v))
              .filter(Boolean) as string[];
            if (displayNames.length > 0) {
              return [attrId, displayNames.join(", ")];
            }
          }

          const groupId = d.attribute.attribute.presets?.[0];
          const refItems = groupId ? refItemsByGroup[groupId] : [];
          if (refItems && refItems.length > 0) {
            const refMap = new Map(refItems.map((item) => [item.id, item.name]));
            const displayNames = values
              .map((v: string) => refMap.get(v))
              .filter(Boolean) as string[];
            if (displayNames.length > 0) {
              return [attrId, displayNames.join(", ")];
            }
          }

          return [attrId, values.join(", ")];
        }

        return [attrId, values.join(", ")];
      })
      .filter((entry): entry is [string, string] => entry !== null)
  );

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const organizationId = tokenPayload?.organization_id;
    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCategory({ category_id: item.id, organization_id: organizationId });
      toast.success(simplifiedEdit ? "Grade berhasil dihapus" : "Sub Category berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    } catch (err) {
      toastError(err as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="align-top">
      <TableCell className="w-10 pt-3 text-muted-foreground">{num}</TableCell>

      {/* Name */}
      <TableCell className="pt-3 font-medium">{item.name}</TableCell>

      {/* Code */}
      <TableCell className="pt-3 text-center">
        {item.code ? (
          <Badge className="font-mono text-xs" variant="outline">
            {item.code}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Store */}
      <TableCell className="pt-3">
        {item.stores && item.stores.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.stores.map((store) => (
              <Badge key={store.id} className="text-xs" variant="secondary">
                {store.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Dynamic attribute columns */}
      {attributeColumns.map((col) => {
        const value = defaultsByAttrId.get(col.id);
        return (
          <TableCell key={col.id} className="pt-3 text-sm">
            {value ? (
              <span className="font-medium">{value}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </TableCell>
        );
      })}

      {/* Created By */}
      <TableCell className="pt-3 text-sm">
        {item.created_by ? (
          <span className="font-medium">{item.created_by.first_name} {item.created_by.last_name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Updated By */}
      <TableCell className="pt-3 text-sm">
        {item.updated_by ? (
          <span className="font-medium">{item.updated_by.first_name} {item.updated_by.last_name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="pt-2 text-center">
        <div className="flex justify-center gap-2">
          <SubCategoryModalAdd
            categoryId={categoryId}
            simplifiedMode={simplifiedEdit}
            subAttributes={subAttributeItems}
            subCode={item.code}
            subDefaults={subDefaults}
            subId={item.id}
            subName={item.name}
            subStoreId={item.stores?.[0]?.id}
            templateOptions={simplifiedEdit ? templateOptions : []}
            trigger={<ButtonEdit />}
          />
          <ButtonDelete disabled={isDeleting} onSubmit={handleDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubCategoryItem;
