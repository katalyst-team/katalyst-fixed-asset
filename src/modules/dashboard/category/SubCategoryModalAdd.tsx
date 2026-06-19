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
import { useUser } from "@/context/user-context";
import useCreateCategoryDataMutation from "@/hooks/api/category/useCreateCategoryDataMutation";
import useEditCategoryDataMutation from "@/hooks/api/category/useEditCategoryDataMutation";
import { toastError } from "@/services";
import { AttributeDefaultRequest, CategoryItemType } from "@/types/category";

import { CategoryAttributeItem, CategoryAttributeSelector } from "./CategoryAttributeSelector";
import SubCategoryAttributeDefaults from "./SubCategoryAttributeDefaults";

interface SubCategoryModalAddProps {
  categoryId: string;
  parentAttributeItems?: CategoryAttributeItem[];
  parentAttributeDefaults?: AttributeDefaultRequest[];
  simplifiedMode?: boolean;
  subAttributes?: CategoryAttributeItem[];
  subCode?: string | null;
  subDefaults?: AttributeDefaultRequest[];
  subId?: string;
  subName?: string;
  subStoreId?: string;
  templateOptions?: CategoryItemType[];
  trigger?: React.ReactNode;
}

const SubCategoryModalAdd = ({
  categoryId,
  parentAttributeItems = [],
  parentAttributeDefaults = [],
  simplifiedMode = false,
  subAttributes = [],
  subCode,
  subDefaults = [],
  subId,
  subName,
  subStoreId,
  templateOptions = [],
  trigger,
}: SubCategoryModalAddProps) => {
  const { t } = useTranslation("category");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(subCode || "");
  const [name, setName] = useState(subName || "");
  const [attributeItems, setAttributeItems] = useState<CategoryAttributeItem[]>(subAttributes);
  const [attributeDefaults, setAttributeDefaults] = useState<AttributeDefaultRequest[]>(subDefaults);
  const { hasMultipleStores, stores, tokenPayload } = useUser();
  const defaultStoreId = !hasMultipleStores && stores.length === 1 ? stores[0].id : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(subStoreId ?? defaultStoreId);
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutateAsync: createCategory } = useCreateCategoryDataMutation();
  const { isPending: isEditing, mutateAsync: editCategory } = useEditCategoryDataMutation();

  const isEditMode = Boolean(subId);
  const isPending = isCreating || isEditing;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setCode(subCode || "");
      setName(subName || "");
      if (isEditMode) {
        setAttributeItems(subAttributes);
        setAttributeDefaults(subDefaults);
      } else {
        const initialAttrs = subAttributes.length > 0 ? subAttributes : parentAttributeItems;
        const initialDefs = subDefaults.length > 0 ? subDefaults : parentAttributeDefaults;
        setAttributeItems(initialAttrs);
        setAttributeDefaults(initialDefs);
      }
      setSelectedStoreId(subStoreId ?? defaultStoreId);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templateOptions.find((t) => t.id === templateId);
    if (!template) return;
    const items: CategoryAttributeItem[] =
      template.attribute_items?.map((ai) => ({
        attribute_id: ai.attribute.id,
        is_required: ai.is_required,
      })) ?? [];
    const defaults: AttributeDefaultRequest[] =
      template.attribute_defaults?.map((d) => ({
        attribute_id: d.attribute.attribute.id,
        values: d.values,
      })) ?? [];
    setAttributeItems(items);
    setAttributeDefaults(defaults);
  };

  const handleAttributeItemsChange = (items: CategoryAttributeItem[]) => {
    setAttributeItems(items);
    const ids = new Set(items.map((i) => i.attribute_id));
    setAttributeDefaults((prev) => prev.filter((d) => ids.has(d.attribute_id)));
  };

  const handleSubmit = async () => {
    const organizationId = tokenPayload?.organization_id || "";
    const payload = {
      ...(attributeDefaults.length > 0 && { attribute_defaults: attributeDefaults }),
      ...(attributeItems.length > 0 && { attribute_items: attributeItems }),
      ...(simplifiedMode ? { code } : code ? { code } : {}),
      ...(selectedStoreId && selectedStoreId !== "all" && { store_ids: [selectedStoreId] }),
      name,
      organization_id: organizationId,
      parent_id: categoryId,
    };

    try {
      if (isEditMode) {
        await editCategory({ ...payload, category_id: subId! });
        toast.success(simplifiedMode ? "Grade berhasil diperbarui" : "Sub Category berhasil diperbarui");
      } else {
        await createCategory(payload);
        toast.success(simplifiedMode ? "Grade berhasil ditambahkan" : "Sub Category berhasil ditambahkan");
      }
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setOpen(false);
    } catch (err) {
      toastError(err as Error | AxiosError);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      {simplifiedMode
        ? isEditMode ? "Simpan" : "Tambah Grade"
        : isEditMode ? t("sub.modal.edit.button") : t("sub.modal.add.button")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {simplifiedMode
              ? isEditMode ? "Edit Grade" : "Add Grade"
              : isEditMode ? t("sub.modal.edit.title") : t("sub.modal.add.title")}
          </DialogTitle>
          <DialogDescription>
            {simplifiedMode
              ? isEditMode ? "Edit data grade" : "Tambah grade baru"
              : isEditMode ? t("sub.modal.edit.description") : t("sub.modal.add.description")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          <div className="flex flex-col gap-4 py-4 pr-4">
            {templateOptions.length > 0 && !isEditMode && (
              <div className="grid gap-2">
                <Label>
                  {simplifiedMode
                    ? isEditMode
                      ? "Salin nilai dari grade lain"
                      : "Grade referensi"
                    : t("sub.modal.add.copyFromTemplate")}
                </Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        simplifiedMode
                          ? isEditMode
                            ? "Pilih grade untuk salin nilainya..."
                            : "Pilih grade referensi..."
                          : t("sub.modal.add.copyFromTemplatePlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map((tmpl) => (
                      <SelectItem key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!simplifiedMode && (
                  <p className="text-xs text-muted-foreground">
                    {t("sub.modal.add.copyFromTemplateDescription")}
                  </p>
                )}
              </div>
            )}
            <InputWithLabel
              label={simplifiedMode ? "Code" : isEditMode ? t("sub.modal.edit.code") : t("sub.modal.add.code")}
              placeholder={
                simplifiedMode ? "Enter code" : isEditMode ? t("sub.modal.edit.codePlaceholder") : t("sub.modal.add.codePlaceholder")
              }
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <InputWithLabel
              label={simplifiedMode ? "Grade Name" : isEditMode ? t("sub.modal.edit.name") : t("sub.modal.add.name")}
              placeholder={
                simplifiedMode ? "Enter grade name" : isEditMode
                  ? t("sub.modal.edit.namePlaceholder")
                  : t("sub.modal.add.namePlaceholder")
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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

            {!simplifiedMode && (
              <div className="grid gap-2">
                <Label>
                  {isEditMode ? t("sub.modal.edit.attributes") : t("sub.modal.add.attributes")}
                </Label>
                <CategoryAttributeSelector
                  initialItems={attributeItems}
                  onChange={handleAttributeItemsChange}
                />
              </div>
            )}
            {attributeItems.length > 0 && (
              <SubCategoryAttributeDefaults
                attributeItems={attributeItems}
                defaults={attributeDefaults}
                isEditMode={isEditMode}
                onChange={setAttributeDefaults}
              />
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t pt-4">
          <Button disabled={isPending || !name || (simplifiedMode && !code)} type="button" onClick={handleSubmit}>
            {isPending
              ? (simplifiedMode ? "Menyimpan..." : isEditMode ? t("sub.modal.edit.editing") : t("sub.modal.add.creating"))
              : (simplifiedMode ? (isEditMode ? "Save" : "Add Grade") : isEditMode ? t("sub.modal.edit.button") : t("sub.modal.add.button"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubCategoryModalAdd;
