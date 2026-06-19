import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user-context";
import useCreateCategoryDataMutation from "@/hooks/api/category/useCreateCategoryDataMutation";
import useEditCategoryDataMutation from "@/hooks/api/category/useEditCategoryDataMutation";
import { toastError } from "@/services";

import { CategoryAttributeCollectionSelector } from "./CategoryAttributeCollectionSelector";
import {
  CategoryAttributeItem,
  CategoryAttributeSelector,
} from "./CategoryAttributeSelector";
import { useCategory } from "./useCategory";

interface CategoryModalAddCategoryProps {
  categoryAttributes?: CategoryAttributeItem[];
  categoryId?: string;
  categoryName?: string;
  categoryStoreId?: string;
  isSubcategory?: boolean;
  parentCategoryId?: string;
  trigger?: React.ReactNode;
}

const CategoryModalAddCategory = ({
  categoryAttributes = [],
  categoryId,
  categoryName,
  categoryStoreId,
  isSubcategory = false,
  parentCategoryId,
  trigger,
}: CategoryModalAddCategoryProps) => {
  const { t } = useTranslation("category");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [attributeItems, setAttributeItems] =
    useState<CategoryAttributeItem[]>(categoryAttributes);
  const [attributeMode, setAttributeMode] = useState<"individual" | "collection">("individual");
  const [categoryParent, setCategoryParent] = useState(parentCategoryId || "");
  const [name, setName] = useState(categoryName || "");
  const { filters } = useCategory();
  const { hasMultipleStores, stores, tokenPayload } = useUser();
  const defaultStoreId = !hasMultipleStores && stores.length === 1 ? stores[0].id : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(categoryStoreId ?? defaultStoreId);

  const { isPending: isCreating, mutateAsync: createCategory } = useCreateCategoryDataMutation();
  const { isPending: isEditing, mutateAsync: editCategory } = useEditCategoryDataMutation();

  const isEditMode = Boolean(categoryId);
  const isPending = isCreating || isEditing;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      if (isEditMode) {
        setName(categoryName || "");
        setCategoryParent(parentCategoryId || "");
        setAttributeItems(categoryAttributes);
        setSelectedStoreId(categoryStoreId ?? defaultStoreId);
      } else {
        setAttributeItems([]);
        setAttributeMode("individual");
        setCategoryParent("");
        setName("");
        setSelectedStoreId(defaultStoreId);
      }
    }
  };

  const handleSubmit = async () => {
    const organizationId = tokenPayload?.organization_id || "";

    try {
      const payload = {
        name,
        organization_id: organizationId,
        ...(attributeItems.length > 0 && {
          attribute_items: attributeItems.map((item) => ({
            attribute_id: item.attribute_id,
            is_required: item.is_required,
          })),
        }),
        ...(categoryParent && !isSubcategory && { parent_category_id: categoryParent }),
        ...(selectedStoreId && selectedStoreId !== "all" && { store_ids: [selectedStoreId] }),
      };

      if (isEditMode) {
        await editCategory({ ...payload, category_id: categoryId! });
        toast.success(t("category.modal.edit.updated"));
      } else {
        await createCategory(payload);
        toast.success(t("category.modal.create.created"));
      }

      queryClient.invalidateQueries({ queryKey: ["categoryData", filters] });
      setOpen(false);
    } catch (err: unknown) {
      toastError(err as Error | AxiosError | { message?: string });
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      {isEditMode ? t("category.modal.edit.button") : t("category.modal.create.button")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("category.modal.edit.title") : t("category.modal.create.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("category.modal.edit.description")
              : t("category.modal.create.description")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="flex py-4 flex-col w-full gap-4 pr-2">
            <InputWithLabel
              label={t(
                isEditMode
                  ? "category.modal.edit.categoryName"
                  : "category.modal.create.categoryName"
              )}
              placeholder={t(
                isEditMode
                  ? "category.modal.edit.categoryNamePlaceholder"
                  : "category.modal.create.categoryNamePlaceholder"
              )}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Store assignment */}
              <div className="grid gap-2">
                <Label>Store</Label>
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Pastikan store yang dipilih sudah benar sebelum menyimpan
                </p>
              </div>

            {/* Attributes Selection */}
            <div className="grid gap-2">
              <Label>{t("category.modal.create.attributes")}</Label>
              <Tabs
                value={attributeMode}
                onValueChange={(value) =>
                  setAttributeMode(value as "individual" | "collection")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">
                    {t("category.modal.create.individualAttributes")}
                  </TabsTrigger>
                  <TabsTrigger value="collection">
                    {t("category.modal.create.attributeCollection")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="individual">
                  <CategoryAttributeSelector
                    initialItems={attributeItems}
                    onChange={setAttributeItems}
                  />
                </TabsContent>
                <TabsContent value="collection">
                  <CategoryAttributeCollectionSelector
                    initialItems={attributeItems}
                    onChange={setAttributeItems}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button disabled={isPending || !name} type="button" onClick={handleSubmit}>
            {isPending
              ? isEditMode
                ? t("category.modal.edit.editing")
                : t("category.modal.create.creating")
              : isEditMode
                ? t("category.modal.edit.button")
                : t("category.modal.create.button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModalAddCategory;
