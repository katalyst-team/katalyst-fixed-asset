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
import { cn } from "@/lib/utils";
import { formatIDRShort } from "@/modules/dashboard/fixed-assets/helpers";

interface OrderStockModalProps {
  onClose: () => void;
  open: boolean;
}

const TAG_TYPES: { cost: number; t: string; vendor: string }[] = [
  { cost: 4000, t: "Avery RF600 soft inlay", vendor: "PT. Avery Indonesia" },
  {
    cost: 32000,
    t: "Confidex Carrier (anti-metal)",
    vendor: "PT. Confidex ID",
  },
  {
    cost: 28000,
    t: "Confidex Survivor (anti-metal)",
    vendor: "PT. Confidex ID",
  },
  { cost: 84000, t: "HID IronStor (industrial)", vendor: "PT. HID Global" },
  {
    cost: 48000,
    t: "SATO IT80 (autoclave-safe)",
    vendor: "PT. SATO Indonesia",
  },
];

export function OrderStockModal({ onClose, open }: OrderStockModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isOrdering, mutateAsync: orderTags } =
    useOrderRFIDTagsMutation({ organizationId });
  const [qty, setQty] = useState("1000");
  const [tagType, setTagType] = useState(TAG_TYPES[0].t);

  const selected = TAG_TYPES.find((item) => item.t === tagType) ?? TAG_TYPES[0];
  const total = selected.cost * (parseInt(qty, 10) || 0);

  const handleSubmit = async () => {
    await orderTags({
      items: [
        {
          cat: "it",
          qty: parseInt(qty, 10) || 0,
          size: "standard",
          tag_type: selected.t,
        },
      ],
      supplier: selected.vendor,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Order tag stock</DialogTitle>
          <DialogDescription>
            Creates a purchase order with the mapped tag vendor
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
                {TAG_TYPES.map((item) => (
                  <SelectItem key={item.t} value={item.t}>
                    {item.t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-qty">Quantity</Label>
            <Input
              id="tag-qty"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tag-vendor">Vendor</Label>
            <Input disabled id="tag-vendor" value={selected.vendor} />
          </div>

          <div
            className={cn(
              "flex items-center justify-between rounded-lg border border-border p-3",
              "bg-muted/40",
            )}
          >
            <span className="text-sm text-muted-foreground">
              Estimated total ({formatIDRShort(selected.cost)}/tag)
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                total > 0 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {formatIDRShort(total)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isOrdering}
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
