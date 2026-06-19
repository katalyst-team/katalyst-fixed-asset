import { AxiosError } from "axios";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useUpsertSubcategoryAttributesMutation from "@/hooks/api/category/useUpsertSubcategoryAttributesMutation";
import { toastError } from "@/services";
import { CategoryItemType } from "@/types/category";

import { CategoryAttributeItem, CategoryAttributeSelector } from "./CategoryAttributeSelector";
import SubCategoryExportButton from "./SubCategoryExportButton";
import SubCategoryExportTemplateButton from "./SubCategoryExportTemplateButton";
import SubCategoryImportModal from "./SubCategoryImportModal";
import SubCategoryModalAdd from "./SubCategoryModalAdd";

const LIMIT_OPTIONS = [10, 20, 50, 100];

interface SubCategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  hideBack?: boolean;
  limit: number;
  parentAttributeDefaults?: { attribute_id: string; values: string[] }[];
  parentAttributeItems?: CategoryAttributeItem[];
  searchQuery: string;
  showBulkApplyAttributes?: boolean;
  storeId: string | undefined;
  subCategories: CategoryItemType[];
  onLimitChange: (limit: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSearchChange: (value: string) => void;
  onStoreIdChange: (storeId: string | undefined) => void;
}

const SubCategoryHeader = ({
  categoryId,
  categoryName,
  currentPage,
  hasNextPage,
  hasPrevPage,
  hideBack,
  limit,
  parentAttributeDefaults,
  parentAttributeItems,
  searchQuery,
  showBulkApplyAttributes = false,
  storeId,
  subCategories,
  onLimitChange,
  onNext,
  onPrev,
  onSearchChange,
  onStoreIdChange,
}: SubCategoryHeaderProps) => {
  const { t } = useTranslation("category");
  const router = useRouter();
  const { stores, tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const [bulkAttributeItems, setBulkAttributeItems] = useState<CategoryAttributeItem[]>([]);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const { isPending: isUpserting, mutateAsync: upsertAttributes } =
    useUpsertSubcategoryAttributesMutation();
  const backPath = "/dashboard/category";

  useEffect(() => {
    if (subCategories.length === 0) {
      setBulkAttributeItems([]);
      return;
    }

    const initialItems: CategoryAttributeItem[] = (subCategories[0].attribute_items ?? []).map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));
    setBulkAttributeItems(initialItems);
  }, [subCategories]);

  const onApplyAttributes = async () => {
    if (!organizationId || !categoryId || bulkAttributeItems.length === 0) return;

    try {
      await upsertAttributes({
        attribute_items: bulkAttributeItems,
        category_id: categoryId,
        organization_id: organizationId,
      });
      toast.success("Attribute berhasil diterapkan ke semua subcategory");
      setOpenBulkModal(false);
      router.replace(router.asPath);
    } catch (error) {
      toastError(error as Error | AxiosError);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: title + primary action — hidden when hideBack */}
      {!hideBack && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={backPath}>
              <Button size="icon" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold font-heading">{t("sub.title")}</h1>
              <p className="text-sm text-muted-foreground">{categoryName}</p>
            </div>
          </div>
          <SubCategoryModalAdd categoryId={categoryId} parentAttributeDefaults={parentAttributeDefaults} parentAttributeItems={parentAttributeItems} templateOptions={subCategories} />
        </div>
      )}

      {/* Row 2: filters (left) | actions + pagination (right) */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: search + store */}
        <div className="flex flex-nowrap items-center gap-2">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-[200px] pl-8 text-sm"
              placeholder={t("sub.filter.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <Select
            value={storeId ?? "all"}
            onValueChange={(v) => onStoreIdChange(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-[160px]">
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
        </div>

        {/* Right: data actions + limit + pagination */}
        <div className="flex flex-nowrap items-center gap-2">
          {showBulkApplyAttributes && (
            <Dialog open={openBulkModal} onOpenChange={setOpenBulkModal}>
              <DialogTrigger asChild>
                <Button variant="outline">Apply Attributes</Button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="px-6 pt-6">Apply Attributes to All Subcategory</DialogTitle>
                  <DialogDescription className="px-6">
                    Attribute yang dipilih akan di-add/update ke semua subcategory dalam parent category ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid flex-1 gap-2 overflow-y-auto px-6 pb-24">
                  <Label>Attributes</Label>
                  <CategoryAttributeSelector
                    initialItems={bulkAttributeItems}
                    onChange={setBulkAttributeItems}
                  />
                </div>
                <DialogFooter className="sticky bottom-0 z-10 border-t bg-background px-6 py-4">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isUpserting || bulkAttributeItems.length === 0}
                    type="button"
                    onClick={onApplyAttributes}
                  >
                    {isUpserting ? "Applying..." : "Apply to All Subcategory"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <SubCategoryExportButton categoryName={categoryName} subCategories={subCategories} />
          <SubCategoryExportTemplateButton categoryName={categoryName} subCategories={subCategories} />
          <SubCategoryImportModal
            categoryId={categoryId}
            organizationId={organizationId}
            subCategories={subCategories}
          />

          <Separator className="h-6" orientation="vertical" />

          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Pagination>
            <PaginationCursor
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onNext={onNext}
              onPrev={onPrev}
            />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryHeader;
