import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import ButtonEdit from "@/components/shared/ButtonEdit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteCategoryDataMutation from "@/hooks/api/category/useDeleteCategoryDataMutation";
import { CategoryItemType } from "@/types/category";

import KbmKayuLaminaModalAdd from "./KbmKayuLaminaModalAdd";

interface KbmKayuLaminaListItemProps {
  item: CategoryItemType;
  num: number;
}

const KbmKayuLaminaListItem = ({ item, num }: KbmKayuLaminaListItemProps) => {
  const { t } = useTranslation("kbm-kayu-lamina");
  const basePath = "/dashboard/kbm-kayu-lamina";
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteCategory } = useDeleteCategoryDataMutation();

  const hasSubcategories = item.has_subcategories ?? (item.subcategories?.length ?? 0) > 0;
  const subCount = item.subcategories_count ?? item.subcategories?.length ?? 0;
  const hasDirectAttributes =
    (item.attribute_items?.length ?? 0) > 0 && !hasSubcategories;
  const hasCategoryAttributes = (item.attribute_items?.length ?? 0) > 0;
  const editAttributeItems = hasCategoryAttributes
    ? item.attribute_items!.map((ai) => ({
        attribute_id: ai.attribute.id,
        is_required: ai.is_required,
      }))
    : [];
  const editDefaults = hasCategoryAttributes
    ? (item.attribute_defaults ?? []).map((d) => ({
        attribute_id: d.attribute.attribute.id,
        values: d.values,
      }))
    : [];

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const organizationId = tokenPayload?.organization_id;
    if (!organizationId) {
      toast.error(t("table.item.errorOrganizationNotFound"));
      return;
    }

    await deleteCategory({ category_id: item.id, organization_id: organizationId });
    toast.success(t("table.item.toastDeleted"));
    queryClient.invalidateQueries({ queryKey: ["categoryData"] });
  };

  return (
    <TableRow>
      <TableCell className="w-10">{num}</TableCell>
      <TableCell>
        {hasSubcategories ? (
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            <Badge className="text-xs" variant="secondary">
              {subCount} {t("table.item.sub")}
            </Badge>
          </div>
        ) : hasDirectAttributes ? (
          <Accordion collapsible className="w-full" type="single">
            <AccordionItem value="attrs">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{item.name}</span>
                  <Badge className="text-xs" variant="secondary">
                    {item.attribute_items!.length} {item.attribute_items!.length !== 1 ? t("table.item.attributes") : t("table.item.attribute")}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {item.attribute_items!.map((ai) => (
                    <div
                      key={ai.attribute.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ai.attribute.name}</span>
                        <Badge className="text-xs" variant="outline">
                          {ai.attribute.type}
                        </Badge>
                        {ai.is_required && (
                          <Badge className="text-xs" variant="destructive">
                            {t("table.item.required")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <span>{item.name}</span>
        )}
      </TableCell>
      <TableCell className="text-center">{item.code || "-"}</TableCell>
      <TableCell className="text-center">{subCount}</TableCell>
      <TableCell>
        {item.stores && item.stores.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.stores.map((store) => (
              <Badge key={store.id} variant="outline">
                {store.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center gap-2">
          <ButtonDetail href={`${basePath}/${item.id}`} />
          <KbmKayuLaminaModalAdd
            categoryAttributeItems={editAttributeItems}
            categoryCode={item.code}
            categoryDefaults={editDefaults}
            categoryId={item.id}
            categoryName={item.name}
            categoryStoreId={item.stores?.[0]?.id}
            hasSubCategoryInitial={!hasDirectAttributes}
            trigger={<ButtonEdit />}
          />
          <ButtonDelete onSubmit={handleDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default KbmKayuLaminaListItem;
