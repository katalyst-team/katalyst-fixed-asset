"use client";

import { PackageCheck } from "lucide-react";
import { useState } from "react";

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
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Order tag stock</DialogTitle>
          <DialogDescription>
            Creates a purchase order with the selected supplier
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tag-type">Tag type</Label>
            <Select value={tagType} onValueChange={setTagType}>
              <SelectTrigger id="tag-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-cat">Category</Label>
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
            <Label htmlFor="tag-qty">Quantity</Label>
            <Input
              id="tag-qty"
              min={1}
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-supplier">Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger id="tag-supplier">
                <SelectValue placeholder="Select supplier" />
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
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isOrdering || !isValid}
            type="button"
            onClick={handleSubmit}
          >
            <PackageCheck size={14} />
            Create PO
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
