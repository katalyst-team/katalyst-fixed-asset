import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryItemType } from "@/types/category";

import CategoryDirectHeader from "./CategoryDirectHeader";

interface CategoryDirectViewProps {
  category: CategoryItemType;
}

const CategoryDirectView = ({ category }: CategoryDirectViewProps) => {
  const { t } = useTranslation("category");

  return (
    <div className="flex w-full flex-col gap-4">
      <CategoryDirectHeader category={category} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Attributes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("direct.attributes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {category.attribute_items && category.attribute_items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {category.attribute_items.map((ai) => (
                  <Badge key={ai.attribute.id} variant="secondary">
                    {ai.attribute.name}
                    {ai.is_required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("direct.noAttributes")}</p>
            )}
          </CardContent>
        </Card>

        {/* Default Values */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("direct.defaultValues")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {category.attribute_defaults && category.attribute_defaults.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {category.attribute_defaults
                  .filter((d) => d.values.length > 0 && d.attribute.attribute.type !== "REFERENCE_GROUP")
                  .map((d) => (
                    <span key={d.attribute.attribute.id} className="text-sm">
                      <span className="text-muted-foreground">
                        {d.attribute.attribute.name}:{" "}
                      </span>
                      <span className="font-semibold text-foreground">
                        {d.values.join(", ")}
                      </span>
                    </span>
                  ))}
                {category.attribute_defaults.every((d) => d.values.length === 0) && (
                  <p className="text-sm text-muted-foreground">{t("direct.noDefaultValues")}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("direct.noDefaultValues")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDirectView;
