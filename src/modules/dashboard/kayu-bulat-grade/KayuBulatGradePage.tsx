"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Loading from "@/components/shared/Loading";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useUpsertSubcategoryAttributesMutation from "@/hooks/api/category/useUpsertSubcategoryAttributesMutation";
import { SubCategoryModalAdd, SubCategoryPage } from "@/modules/dashboard/category";
import { CategoryAttributeItem } from "@/modules/dashboard/category/CategoryAttributeSelector";
import { CategoryAttributeSelector } from "@/modules/dashboard/category/CategoryAttributeSelector";
import { toastError } from "@/services";
import { AttributeDefaultRequest, CategoryItemType } from "@/types/category";

const KayuBulatGradePage = () => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [gradeAttributeItems, setGradeAttributeItems] = useState<CategoryAttributeItem[]>([]);
  const [isBulkAttributeModalOpen, setIsBulkAttributeModalOpen] = useState(false);
  const [bulkAttributeItems, setBulkAttributeItems] = useState<CategoryAttributeItem[]>([]);

  const { data: categoryData, isLoading } = useGetCategoryDataQuery({ organizationId });
  const { isPending: isUpsertingAttributes, mutateAsync: upsertAttributes } =
    useUpsertSubcategoryAttributesMutation();

  const kayuBulatCategories = useMemo(() => {
    return (categoryData?.data?.categories ?? []).filter((c) =>
      c.name.startsWith("KAYU BULAT"),
    );
  }, [categoryData]);

  const selectedCategory = useMemo(
    () => kayuBulatCategories.find((c) => c.id === selectedCategoryId),
    [kayuBulatCategories, selectedCategoryId],
  );

  const parentAttributeItems = useMemo<CategoryAttributeItem[]>(() => {
    if (!selectedCategory?.attribute_items) return [];
    return selectedCategory.attribute_items.map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));
  }, [selectedCategory]);

  const parentAttributeDefaults = useMemo<AttributeDefaultRequest[]>(() => {
    if (!selectedCategory?.attribute_defaults) return [];
    return selectedCategory.attribute_defaults.map((d) => ({
      attribute_id: d.attribute.attribute.id,
      values: d.values,
    }));
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategoryId && kayuBulatCategories.length > 0) {
      setSelectedCategoryId(kayuBulatCategories[0].id);
    }
  }, [kayuBulatCategories, selectedCategoryId]);

  useEffect(() => {
    setGradeAttributeItems([]);
  }, [selectedCategoryId]);

  useEffect(() => {
    setBulkAttributeItems(gradeAttributeItems);
  }, [gradeAttributeItems, selectedCategoryId]);

  const handleSubCategoriesLoad = useCallback((subs: CategoryItemType[]) => {
    if (subs.length === 0) return;
    const items: CategoryAttributeItem[] = (subs[0].attribute_items ?? []).map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));
    setGradeAttributeItems(items);
  }, []);

  const handleApplyAttributes = async () => {
    if (!selectedCategoryId || !organizationId || bulkAttributeItems.length === 0) return;

    try {
      await upsertAttributes({
        attribute_items: bulkAttributeItems,
        category_id: selectedCategoryId,
        organization_id: organizationId,
      });
      setGradeAttributeItems(bulkAttributeItems);
      toast.success("Attribute grade berhasil diterapkan ke semua subcategory");
      setIsBulkAttributeModalOpen(false);
    } catch (err) {
      toastError(err as Error | AxiosError);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 flex items-center justify-between gap-3">
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            {kayuBulatCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <Dialog open={isBulkAttributeModalOpen} onOpenChange={setIsBulkAttributeModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Apply Attributes</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Apply Attributes to All Grade</DialogTitle>
                  <DialogDescription>
                    Attribute yang dipilih akan di-add/update ke semua subcategory di parent category ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label>Attributes</Label>
                  <CategoryAttributeSelector
                    initialItems={bulkAttributeItems}
                    onChange={setBulkAttributeItems}
                  />
                </div>
                <DialogFooter className="border-t pt-4">
                  <Button
                    disabled={isUpsertingAttributes || bulkAttributeItems.length === 0}
                    type="button"
                    onClick={handleApplyAttributes}
                  >
                    {isUpsertingAttributes ? "Applying..." : "Apply to All Grade"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {selectedCategoryId && (
            <SubCategoryModalAdd
              simplifiedMode
              categoryId={selectedCategoryId}
              parentAttributeDefaults={parentAttributeDefaults}
              parentAttributeItems={parentAttributeItems}
              subAttributes={gradeAttributeItems}
              trigger={<Button>Add Grade</Button>}
            />
          )}
        </div>
      </div>
      {selectedCategoryId && (
        <SubCategoryPage
          hideBack
          simplifiedEdit
          categoryId={selectedCategoryId}
          subAttributes={gradeAttributeItems}
          onSubCategoriesLoad={handleSubCategoriesLoad}
        />
      )}
    </div>
  );
};

export default KayuBulatGradePage;