"use client";

import { useTranslation } from "next-i18next";

import Loading from "@/components/shared/Loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetPackingCollectionDetailQuery from "@/hooks/api/packing-collection/useGetPackingCollectionDetailQuery";

interface PackingCollectionDetailWrapperProps {
  packingCollectionId: string;
}

const PackingCollectionDetailWrapper: React.FC<PackingCollectionDetailWrapperProps> = ({
  packingCollectionId,
}) => {
  const { t } = useTranslation(["packing-collection"]);
  const { tokenPayload } = useUser();

  const { data, isLoading, error } = useGetPackingCollectionDetailQuery({
    organizationId: tokenPayload?.organization_id || "",
    packingCollectionId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold font-heading mb-2">Error Loading Collection</h3>
          <p className="text-muted-foreground">
            Failed to load packing collection details.
          </p>
        </div>
      </div>
    );
  }

  const collection = data.data;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {collection.name}
            <Badge variant="outline">
              {collection.packing_items?.length || 0} {t("detail.items")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium font-heading mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {collection.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.items")}</CardTitle>
        </CardHeader>
        <CardContent>
          {collection.packing_items && collection.packing_items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>{t("detail.sku")}</TableHead>
                  <TableHead>{t("detail.quantity")}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.packing_items.map((item, index) => (
                  <TableRow key={`${item.sku_id.id}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {item.sku_id.name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.sku_id.status === "ACTIVE" ? "default" : "destructive"}
                      >
                        {item.sku_id.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items found in this collection</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackingCollectionDetailWrapper;