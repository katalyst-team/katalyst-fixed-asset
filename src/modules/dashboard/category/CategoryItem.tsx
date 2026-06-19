import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
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
import { toastError } from "@/services";
import { CategoryItemType } from "@/types/category";

import CategoryModalAddCategory from "./CategoryModalAddCategory";

interface CategoryItemProps {
  item: CategoryItemType;
  num: number;
}

const CategoryItem = ({ item, num }: CategoryItemProps) => {
  const { mutateAsync: deleteCategory } = useDeleteCategoryDataMutation();
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCategory = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple delete calls
    if (isDeleting) {
      return;
    }

    const categoryId = item.id;
    const organizationId = tokenPayload?.organization_id;

    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsDeleting(true);
    deleteCategory({
      category_id: categoryId,
      organization_id: organizationId,
    })
      .then(() => {
        toast.success("Category deleted successfully");
        // Invalidate queries more specifically
        queryClient.invalidateQueries({
          queryKey: ["categoryData"],
        });
      })
      .catch((error) => {
        toastError(error as Error);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <TableRow>
      <TableCell className="w-10">
        <p>{num}</p>
      </TableCell>
      <TableCell>
        <Accordion collapsible className="w-full" type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span>{item.name}</span>
                {item.attribute_items && item.attribute_items.length > 0 && (
                  <Badge className="text-xs" variant="secondary">
                    {item.attribute_items.length} attribute
                    {item.attribute_items.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {item.attribute_items && item.attribute_items.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Attributes:
                  </p>
                  <div className="grid gap-2">
                    {item.attribute_items.map((attributeItem) => (
                      <div
                        key={attributeItem.attribute.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {attributeItem.attribute.name}
                          </span>
                          <Badge className="text-xs" variant="outline">
                            {attributeItem.attribute.type}
                          </Badge>
                          {attributeItem.is_required && (
                            <Badge className="text-xs" variant="destructive">
                              Required
                            </Badge>
                          )}
                        </div>
                        {attributeItem.attribute.description && (
                          <p className="text-xs text-muted-foreground max-w-xs truncate">
                            {attributeItem.attribute.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attributes assigned to this category.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <CategoryModalAddCategory
            categoryAttributes={
              item.attribute_items?.map((item) => ({
                attribute_id: item.attribute.id,
                is_required: item.is_required,
              })) || []
            }
            categoryId={item.id}
            categoryName={item.name}
            categoryStoreId={item.stores?.[0]?.id}
            isSubcategory={false}
            trigger={<ButtonEdit />}
          />
          <ButtonDelete disabled={isDeleting} onSubmit={handleDeleteCategory} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryItem;
