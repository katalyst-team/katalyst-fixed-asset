import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { Button } from "@/components/ui/button";
import { CategoryItemType } from "@/types/category";
import { AttributeDefaultRequest } from "@/types/category";

import { CategoryAttributeItem } from "./CategoryAttributeSelector";
import CategoryModalAdd from "./CategoryModalAdd";

interface CategoryDirectHeaderProps {
  category: CategoryItemType;
}

const CategoryDirectHeader = ({ category }: CategoryDirectHeaderProps) => {
  const { t } = useTranslation("category");

  const editAttributeItems: CategoryAttributeItem[] =
    category.attribute_items?.map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    })) || [];

  const editDefaults: AttributeDefaultRequest[] =
    category.attribute_defaults?.map((d) => ({
      attribute_id: d.attribute.attribute.id,
      values: d.values,
    })) || [];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/category">
          <Button size="icon" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold font-heading">{t("direct.title")}</h1>
          <p className="text-sm text-muted-foreground">{category.name}</p>
        </div>
      </div>
      <CategoryModalAdd
        categoryAttributeItems={editAttributeItems}
        categoryCode={category.code}
        categoryDefaults={editDefaults}
        categoryId={category.id}
        categoryName={category.name}
        hasSubCategoryInitial={false}
        trigger={<ButtonEdit />}
      />
    </div>
  );
};

export default CategoryDirectHeader;
