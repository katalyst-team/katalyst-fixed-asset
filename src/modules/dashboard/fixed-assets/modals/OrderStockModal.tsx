"use client";

import { PackageCheck } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { useOrderRFIDTagsMutation } from "@/hooks/api/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { useFaSupplierOptions } from "@/modules/dashboard/fixed-assets/modals/types";
import type { AssetCategory } from "@/types/fixed-assets";

interface OrderStockModalProps {
  onClose: () => void;
  open: boolean;
}

const TAG_TYPES = ["passive", "anti-metal", "industrial"] as const;

export function OrderStockModal({ onClose, open }: OrderStockModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isOrdering, mutateAsync: orderTags } =
    useOrderRFIDTagsMutation({ organizationId });
  const supplierOptions = useFaSupplierOptions();
  const [cat, setCat] = useState<AssetCategory>("it");
  const [qty, setQty] = useState("1000");
  const [supplier, setSupplier] = useState("");
  const [tagType, setTagType] = useState<string>(TAG_TYPES[0]);

  const parsedQty = parseInt(qty, 10) || 0;
  const isValid = parsedQty >= 1 && supplier.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await orderTags({
        items: [
          {
            cat,
            qty: parsedQty,
            size: "standard",
            tag_type: tagType,
          },
        ],
        supplier,
      });
      toast.success(t("toasts.stockOrdered"));
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("modals.orderStock.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.orderStock.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tag-type">{t("modals.orderStock.tagType")}</Label>
            <Select value={tagType} onValueChange={setTagType}>
              <SelectTrigger id="tag-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-cat">{t("modals.orderStock.category")}</Label>
            <Select
              value={cat}
              onValueChange={(v) => setCat(v as AssetCategory)}
            >
              <SelectTrigger id="tag-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CAT_LABEL).map(([slug, label]) => (
                  <SelectItem key={slug} value={slug}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-qty">{t("modals.orderStock.quantity")}</Label>
            <Input
              id="tag-qty"
              min={1}
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-supplier">
              {t("modals.orderStock.supplier")}
            </Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger id="tag-supplier">
                <SelectValue
                  placeholder={t("modals.orderStock.selectSupplier")}
                />
              </SelectTrigger>
              <SelectContent>
                {supplierOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            {t("modals.orderStock.cancel")}
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isOrdering || !isValid}
            type="button"
            onClick={handleSubmit}
          >
            <PackageCheck size={14} />
            {t("modals.orderStock.createPo")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
