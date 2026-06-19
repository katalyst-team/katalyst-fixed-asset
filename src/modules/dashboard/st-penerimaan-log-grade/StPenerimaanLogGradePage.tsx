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
import { CategoryItemType } from "@/types/category";

const StPenerimaanLogGradePage = () => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [gradeAttributeItems, setGradeAttributeItems] = useState<CategoryAttributeItem[]>([]);
  const [isBulkAttributeModalOpen, setIsBulkAttributeModalOpen] = useState(false);

  const { data: categoryData, isLoading } = useGetCategoryDataQuery({ organizationId });
  const { isPending: isUpsertingAttributes, mutateAsync: upsertAttributes } =
    useUpsertSubcategoryAttributesMutation();

  const stPenerimaanLogCategories = useMemo(() => {
    return (categoryData?.data?.categories ?? []).filter((c) =>
      c.name.startsWith("PENERIMAAN LOG"),
    );
  }, [categoryData]);

  useEffect(() => {
    if (!selectedCategoryId && stPenerimaanLogCategories.length > 0) {
      setSelectedCategoryId(stPenerimaanLogCategories[0].id);
    }
  }, [stPenerimaanLogCategories, selectedCategoryId]);

  useEffect(() => {
    setGradeAttributeItems([]);
    setIsBulkAttributeModalOpen(false);
  }, [selectedCategoryId]);

  const handleSubCategoriesLoad = useCallback((subs: CategoryItemType[]) => {
    if (subs.length === 0) return;
    const items: CategoryAttributeItem[] = (subs[0].attribute_items ?? []).map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));
    setGradeAttributeItems(items);
  }, []);

  const handleApplyAttributes = async (attributes: CategoryAttributeItem[]) => {
    if (!selectedCategoryId || !organizationId || attributes.length === 0) return;

    try {
      await upsertAttributes({
        attribute_items: attributes,
        category_id: selectedCategoryId,
        organization_id: organizationId,
      });
      setGradeAttributeItems(attributes);
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
          <SelectTrigger className="w-[400px]">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            {stPenerimaanLogCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <ApplyAttributesModal
              key={selectedCategoryId}
              initialAttributes={gradeAttributeItems}
              isOpen={isBulkAttributeModalOpen}
              isPending={isUpsertingAttributes}
              onApply={handleApplyAttributes}
              onClose={() => setIsBulkAttributeModalOpen(false)}
            />
          )}
          {selectedCategoryId && (
            <Button
              disabled={!selectedCategoryId}
              variant="outline"
              onClick={() => setIsBulkAttributeModalOpen(true)}
            >
              Apply Attributes
            </Button>
          )}
          {selectedCategoryId && (
            <SubCategoryModalAdd
              simplifiedMode
              categoryId={selectedCategoryId}
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
          onSubCategoriesLoad={handleSubCategoriesLoad}
        />
      )}
    </div>
  );
};

export default StPenerimaanLogGradePage;

interface ApplyAttributesModalProps {
  initialAttributes: CategoryAttributeItem[];
  isPending: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApply: (attributes: CategoryAttributeItem[]) => Promise<void>;
}

const ApplyAttributesModal: React.FC<ApplyAttributesModalProps> = ({
  initialAttributes,
  isPending,
  isOpen,
  onClose,
  onApply,
}) => {
  const [attributes, setAttributes] = useState<CategoryAttributeItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAttributes(initialAttributes);
    }
  }, [initialAttributes, isOpen]);

  const handleApplyClick = () => {
    onApply(attributes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            initialItems={attributes}
            onChange={setAttributes}
          />
        </div>
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending || attributes.length === 0} type="button" onClick={handleApplyClick}>
            {isPending ? "Applying..." : "Apply to All Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
