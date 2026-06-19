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
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/user-context";
import useCreateCategoryDataMutation from "@/hooks/api/category/useCreateCategoryDataMutation";
import useEditCategoryDataMutation from "@/hooks/api/category/useEditCategoryDataMutation";
import { toastError } from "@/services";
import { PostCategoryDataParams } from "@/services/category/postCategoryDataService";
import { AttributeDefaultRequest } from "@/types/category";

import { CategoryAttributeItem, CategoryAttributeSelector } from "../category/CategoryAttributeSelector";
import SubCategoryAttributeDefaults from "../category/SubCategoryAttributeDefaults";

const KAYU_LAMINA_PREFIX = "LAMINA ";

interface KbmKayuLaminaModalAddProps {
  categoryAttributeItems?: CategoryAttributeItem[];
  categoryCode?: string | null;
  categoryDefaults?: AttributeDefaultRequest[];
  categoryId?: string;
  categoryName?: string;
  categoryStoreId?: string;
  hasSubCategoryInitial?: boolean;
  trigger?: React.ReactNode;
}

const KbmKayuLaminaModalAdd = ({
  categoryAttributeItems,
  categoryCode,
  categoryDefaults,
  categoryId,
  categoryName,
  categoryStoreId,
  hasSubCategoryInitial,
  trigger,
}: KbmKayuLaminaModalAddProps) => {
  const { t } = useTranslation("kbm-kayu-lamina");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(categoryCode || "");
  const [name, setName] = useState(categoryName || "");
  const [hasSubCategory, setHasSubCategory] = useState(
    hasSubCategoryInitial !== undefined ? hasSubCategoryInitial : true
  );
  const [attributeItems, setAttributeItems] = useState<CategoryAttributeItem[]>(
    categoryAttributeItems || []
  );
  const [attributeDefaults, setAttributeDefaults] = useState<AttributeDefaultRequest[]>(
    categoryDefaults || []
  );
  const { hasMultipleStores, stores, tokenPayload } = useUser();
  const defaultStoreId = !hasMultipleStores && stores.length === 1 ? stores[0].id : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(categoryStoreId ?? defaultStoreId);
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutateAsync: createCategory } = useCreateCategoryDataMutation();
  const { isPending: isEditing, mutateAsync: editCategory } = useEditCategoryDataMutation();

  const isEditMode = Boolean(categoryId);
  const isPending = isCreating || isEditing;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setCode(categoryCode || "");
      const initName = categoryName || "";
      setName(initName);
      const initHasSub =
        hasSubCategoryInitial !== undefined
          ? hasSubCategoryInitial
          : !(categoryAttributeItems && categoryAttributeItems.length > 0);
      setHasSubCategory(initHasSub);
      setAttributeItems(categoryAttributeItems || []);
      setAttributeDefaults(categoryDefaults || []);
      setSelectedStoreId(categoryStoreId ?? defaultStoreId);
    }
  };

  const handleHasSubCategoryChange = (checked: boolean) => {
    setHasSubCategory(checked);
  };

  const handleAttributeItemsChange = (items: CategoryAttributeItem[]) => {
    setAttributeItems(items);
    const ids = new Set(items.map((i) => i.attribute_id));
    setAttributeDefaults((prev) => prev.filter((d) => ids.has(d.attribute_id)));
  };

  const handleSubmit = async () => {
    const organizationId = tokenPayload?.organization_id || "";

    let finalName = name.trim();
    if (!finalName.startsWith(KAYU_LAMINA_PREFIX)) {
      finalName = `${KAYU_LAMINA_PREFIX}${finalName}`;
    }

    const payload: PostCategoryDataParams = {
      ...(code && { code }),
      name: finalName,
      organization_id: organizationId,
      ...(selectedStoreId && selectedStoreId !== "all" && { store_ids: [selectedStoreId] }),
    };

    if (attributeItems.length > 0) payload.attribute_items = attributeItems;
    if (attributeDefaults.length > 0) payload.attribute_defaults = attributeDefaults;

    try {
      if (isEditMode) {
        await editCategory({ ...payload, category_id: categoryId! });
        toast.success(t("modal.edit.toastUpdated"));
      } else {
        await createCategory(payload);
        toast.success(t("modal.add.toastCreated"));
      }
      queryClient.invalidateQueries({ queryKey: ["categoryData"] });
      setOpen(false);
    } catch (err) {
      toastError(err as Error | AxiosError);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      {isEditMode ? t("modal.edit.button") : t("modal.add.button")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("modal.edit.title") : t("modal.add.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t("modal.edit.description") : t("modal.add.description")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="flex flex-col gap-4 py-4 pr-2">
            <InputWithLabel
              label={isEditMode ? t("modal.edit.code") : t("modal.add.code")}
              placeholder={
                isEditMode ? t("modal.edit.codePlaceholder") : t("modal.add.codePlaceholder")
              }
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <InputWithLabel
              label={isEditMode ? t("modal.edit.categoryName") : t("modal.add.categoryName")}
              placeholder={
                isEditMode
                  ? t("modal.edit.categoryNamePlaceholder")
                  : t("modal.add.categoryNamePlaceholder")
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

              <div className="grid gap-2">
                <Label>{t("modal.add.store")}</Label>
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("modal.add.storePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("modal.add.storePlaceholder")}</SelectItem>
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

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label className="cursor-pointer text-sm font-medium" htmlFor="has-sub-category">
                {t("modal.add.hasSubCategory")}
              </Label>
              <Switch
                checked={hasSubCategory}
                id="has-sub-category"
                onCheckedChange={handleHasSubCategoryChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>
                {hasSubCategory
                  ? t("modal.add.defaultAttributesForSub")
                  : t("modal.add.attributes")}
              </Label>
              {hasSubCategory && (
                <p className="text-xs text-muted-foreground">
                  {t("modal.add.defaultAttributesForSubDescription")}
                </p>
              )}
              <CategoryAttributeSelector
                initialItems={attributeItems}
                onChange={handleAttributeItemsChange}
              />
              {attributeItems.length > 0 && (
                <div className="mt-4">
                  <SubCategoryAttributeDefaults
                    attributeItems={attributeItems}
                    defaults={attributeDefaults}
                    isEditMode={isEditMode}
                    onChange={setAttributeDefaults}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t pt-4">
          <Button disabled={isPending || !name} type="button" onClick={handleSubmit}>
            {isPending
              ? isEditMode
                ? t("modal.edit.editing")
                : t("modal.add.creating")
              : isEditMode
                ? t("modal.edit.button")
                : t("modal.add.button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KbmKayuLaminaModalAdd;
