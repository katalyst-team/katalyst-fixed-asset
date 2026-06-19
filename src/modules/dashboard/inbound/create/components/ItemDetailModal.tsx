import { Eye } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RfidMapItem } from "@/types/rfid";
import { formatDateTime } from "@/utils/text";

interface ItemDetailModalProps {
  item: RfidMapItem;
}

export function ItemDetailModal({ item }: ItemDetailModalProps) {
  const { t } = useTranslation("common");

  const getRfidTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("rfid.type.reusable", "Reusable");
      case "DISPOSABLE":
        return t("rfid.type.disposable", "Disposable");
      default:
        return type;
    }
  };

  const getRfidCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("rfid.category.single", "Single");
      case "PACKAGE":
        return t("rfid.category.package", "Package");
      default:
        return category;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="border border-blue-400"
          size="icon"
          variant="outline"
        >
          <Eye className="text-blue-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("itemDetails.title", "Item Details")}</DialogTitle>
          <DialogDescription>
            {t("itemDetails.description", "Complete item information")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="space-y-6 p-4">
            {item.sku?.image_urls && item.sku.image_urls.length > 0 && (
              <div className="flex justify-center">
                <div className="relative h-48 w-48 overflow-hidden rounded-lg border">
                  <Image
                    alt={item.sku.name}
                    className="object-cover"
                    height={192}
                    src={item.sku.image_urls[0]}
                    width={192}
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("itemDetails.basicInfo", "Basic Information")}
              </h3>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.itemId", "Item ID")}:
                    </span>
                    <span className="ml-2 font-mono text-xs">
                      {item.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.skuName", "SKU Name")}:
                    </span>
                    <span className="ml-2 font-medium">{item.sku?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.skuCode", "SKU Code")}:
                    </span>
                    <span className="ml-2 font-mono">
                      {item.sku?.sku || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.internalCode", "Internal Code")}:
                    </span>
                    <span className="ml-2 font-mono">
                      {item.sku?.internal_code || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.status", "Status")}:
                    </span>
                    <span className="ml-2">
                      <Badge variant="secondary">{item.status?.name || "-"}</Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.section", "Section")}:
                    </span>
                    <span className="ml-2">{item.section?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.expiryDate", "Expiry Date")}:
                    </span>
                    <span className="ml-2">
                      {item.expiry_date
                        ? new Date(item.expiry_date).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t("itemDetails.categoryInfo", "Category Information")}
              </h3>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.brand", "Brand")}:
                    </span>
                    <span className="ml-2">
                      {item.sku?.brand?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.color", "Color")}:
                    </span>
                    <span className="ml-2">
                      {item.sku?.color?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.size", "Size")}:
                    </span>
                    <span className="ml-2">
                      {item.sku?.size?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("itemDetails.categories", "Categories")}:
                    </span>
                    <span className="ml-2">
                      {item.sku?.categories && item.sku.categories.length > 0
                        ? item.sku.categories.map((cat) => cat.name).join(", ")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {item.rfid_detail && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  {t("itemDetails.rfidInfo", "RFID Information")}
                </h3>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.rfidName", "RFID Name")}:
                      </span>
                      <span className="ml-2">
                        {item.rfid_detail.name || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.epc", "EPC")}:
                      </span>
                      <span className="ml-2 font-mono">
                        {item.rfid_detail.epc}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.rfidType", "RFID Type")}:
                      </span>
                      <span className="ml-2">
                        <Badge variant="outline">
                          {getRfidTypeText(item.rfid_detail.type)}
                        </Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.rfidCategory", "RFID Category")}:
                      </span>
                      <span className="ml-2">
                        <Badge variant="outline">
                          {getRfidCategoryText(item.rfid_detail.category)}
                        </Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.rfidStatus", "RFID Status")}:
                      </span>
                      <span className="ml-2">
                        <Badge
                          variant={
                            item.rfid_detail.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.rfid_detail.status}
                        </Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("itemDetails.updatedAt", "Updated")}:
                      </span>
                      <span className="ml-2">
                        {formatDateTime(item.rfid_detail.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {item.sku?.attributes && item.sku.attributes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  {t("itemDetails.attributes", "Attributes")}
                </h3>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">
                          {t("itemDetails.attributeName", "Name")}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("itemDetails.attributeType", "Type")}
                        </TableHead>
                        <TableHead>
                          {t("itemDetails.attributeValue", "Value")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.sku.attributes.map((attr) => (
                        <TableRow key={attr.attribute_id}>
                          <TableCell>
                            {attr.name}
                            {attr.description && (
                              <span className="block text-xs text-muted-foreground">
                                {attr.description}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="text-xs" variant="outline">
                              {attr.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {attr.values && attr.values.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {attr.values.map((value, idx) => (
                                  <Badge
                                    key={`${attr.attribute_id}-${idx}`}
                                    className="text-xs"
                                    variant="secondary"
                                  >
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">Last Updated: </span>
              <span className="ml-2">
                {formatDateTime(item.updated_at)}
              </span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
