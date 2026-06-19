"use client";

import { useTranslation } from "next-i18next";

import Loading from "@/components/shared/Loading";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetAttributeCollectionQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionQuery";

const AttributeCollectionDetail = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const { t } = useTranslation(["attribute-collection", "common"]);
  const { tokenPayload } = useUser();

  const { data: collectionData, isLoading } = useGetAttributeCollectionQuery({
    attributeCollectionId: collectionId,
    organizationId: tokenPayload?.organization_id || "",
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!collectionData?.data) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>{t("attribute-collection:notFound")}</p>
      </div>
    );
  }

  const collection = collectionData.data;
  const attributeItems = collection.attribute_items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">
          {t("attribute-collection:detail.title")}
        </h1>
      </div>

      {/* Collection Details Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("attribute-collection:form.name")}
              </p>
              <p className="text-base">{collection.name}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("attribute-collection:form.description")}
              </p>
              <p className="text-base">{collection.description || "-"}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("attribute-collection:attributeCount")}
              </p>
              <p className="text-base">{attributeItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes Table */}
      <div>
        <h2 className="text-xl font-semibold font-heading mb-4">
          {t("attribute-collection:attributes")}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t("attribute-collection:table.header.name")}
              </TableHead>
              <TableHead>
                {t("attribute-collection:table.header.description")}
              </TableHead>
              <TableHead>
                {t("attribute-collection:table.header.type")}
              </TableHead>
              <TableHead>{t("attribute-collection:required")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributeItems.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-4" colSpan={4}>
                  {t("attribute-collection:noAttributes")}
                </TableCell>
              </TableRow>
            ) : (
              attributeItems.map((item) => (
                <TableRow key={item.attribute.id}>
                  <TableCell>{item.attribute.name}</TableCell>
                  <TableCell>{item.attribute.description || "-"}</TableCell>
                  <TableCell>{item.attribute.type}</TableCell>
                  <TableCell>
                    {item.is_required
                      ? t("attribute-collection:yes")
                      : t("attribute-collection:no")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttributeCollectionDetail;
