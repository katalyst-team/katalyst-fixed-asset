"use client";

import { Download } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

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
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { ReferenceItemType } from "@/types/reference";
import { exportToExcel } from "@/utils/exportUtils";

interface ReferenceItemExportModalProps {
  groupId: string;
  groupName?: string;
}

const ReferenceItemExportModal = ({
  groupId,
  groupName = "reference",
}: ReferenceItemExportModalProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  const storeId = selectedStoreId !== "all" ? selectedStoreId : undefined;

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  // Fetch all items (high limit) — only triggered when export is initiated
  const { data: allItemsData, isFetching } = useGetReferenceItemsQuery({
    enabled: open,
    groupId,
    limit: 10000,
    organizationId,
    store_id: storeId,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const items: ReferenceItemType[] = allItemsData?.data?.items ?? [];

      if (items.length === 0) {
        toast.error(t("reference:export.noData", "No items to export"));
        return;
      }

      const columns = [
        { key: "name", label: "Name" },
        { key: "code", label: "Code" },
        {
          formatter: (v: unknown) => String(v ?? 0),
          key: "sort_order",
          label: "Sort Order",
        },
        {
          formatter: (v: unknown) => (v ? String(v) : ""),
          key: "store_id",
          label: "Store ID",
        },
        { key: "id", label: "ID" },
      ];

      const storeSuffix = storeId
        ? `-${stores.find((s) => s.id === storeId)?.name ?? storeId}`
        : "";

      await exportToExcel({
        columnWidths: [30, 20, 15, 40, 40],
        columns,
        data: items,
        filename: `${groupName.toLowerCase().replace(/\s+/g, "-")}${storeSuffix}`,
        sheetName: groupName.substring(0, 31),
      });

      toast.success(
        t("reference:export.success", "Exported {{count}} items", {
          count: items.length,
        })
      );
      setOpen(false);
    } catch {
      toast.error(t("common:error.generic", "Export failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          {t("reference:buttons.export", "Export")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("reference:modal.export.title", "Export Items")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "reference:modal.export.description",
              "Export reference items to an Excel file."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("reference:fields.store", "Store")}</Label>
            <Select
              value={selectedStoreId}
              onValueChange={setSelectedStoreId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("reference:fields.storeGlobal", "Global (all stores)")}
                </SelectItem>
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

          <p className="text-sm text-muted-foreground">
            {isFetching
              ? t("reference:export.loading", "Loading items...")
              : t("reference:export.ready", "{{count}} items ready to export", {
                  count: allItemsData?.data?.items?.length ?? 0,
                })}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button disabled={isExporting || isFetching} onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            {isExporting
              ? t("common:downloading", "Downloading...")
              : t("reference:buttons.export", "Export")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceItemExportModal;
