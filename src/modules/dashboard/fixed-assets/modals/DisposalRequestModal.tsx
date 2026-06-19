import { ChevronRight, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatIDRShort } from "@/modules/dashboard/fixed-assets/helpers";
import { ASSETS } from "@/services/fixed-assets/mock";
import type { FaAsset } from "@/types/fixed-assets";

const APPROVAL_CHAIN = [
  "Requester",
  "Dept Head",
  "Finance Manager",
  "CFO",
  "BAST + GL post",
];

const DISPOSAL_METHODS = [
  "Donated",
  "Lost / written off",
  "Obsolete · end of life",
  "Return to vendor",
  "Scrapped / e-waste",
  "Sold · auction",
  "Sold · direct",
];

interface DisposalRequestModalProps {
  onClose: () => void;
  open: boolean;
}

export function DisposalRequestModal({
  onClose,
  open,
}: DisposalRequestModalProps) {
  const [assetId, setAssetId] = useState("");
  const [method, setMethod] = useState("");
  const [reason, setReason] = useState("");
  const [recovery, setRecovery] = useState("");

  const asset: FaAsset | undefined = ASSETS.find((a) => a.id === assetId);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    toast.success("Disposal request submitted · routed to Dept Head");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={18} />
            Disposal Request
          </DialogTitle>
          <DialogDescription>
            Route an asset through the disposal approval workflow. The RFID tag
            is retired on final sign-off.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {ASSETS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {asset && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">NBV</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {formatIDRShort(asset.dep)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="mt-0.5 truncate text-sm font-medium">
                  {asset.loc}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Custodian</div>
                <div className="mt-0.5 truncate text-sm font-medium">
                  {asset.custodian}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Disposal method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {DISPOSAL_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Recovery value (optional)</Label>
            <Input
              min={0}
              placeholder="0"
              type="number"
              value={recovery}
              onChange={(e) => setRecovery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Expected proceeds from sale or trade-in. Leave blank if none.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label isRequired>Reason</Label>
            <Textarea
              placeholder="Explain why this asset should be disposed…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Approval chain</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {APPROVAL_CHAIN.map((step, i) => (
                <div key={step} className="flex items-center gap-1.5">
                  <span className="ks-badge brand">
                    {i + 1} · {step}
                  </span>
                  {i < APPROVAL_CHAIN.length - 1 && (
                    <ChevronRight className="text-muted-foreground" size={14} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            On final approval the RFID tag is deactivated (kill password), the
            loss/gain entry posts to the GL, and the signed BAST PDF is emailed
            to all approvers.
          </p>
        </div>

        <DialogFooter>
          <Button
            className={cn("ks-btn ks-btn-ghost")}
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={cn("ks-btn ks-btn-primary")}
            type="button"
            onClick={handleSubmit}
          >
            Submit for approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
