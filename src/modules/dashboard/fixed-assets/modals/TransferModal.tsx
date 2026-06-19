import { ArrowLeftRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  FA_LOCATIONS,
  FA_PEOPLE,
} from "@/modules/dashboard/fixed-assets/modals/types";
import { ASSETS } from "@/services/fixed-assets/mock";

interface TransferModalProps {
  onClose: () => void;
  open: boolean;
}

export function TransferModal({ onClose, open }: TransferModalProps) {
  const [assetId, setAssetId] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [custodian, setCustodian] = useState("");
  const [reason, setReason] = useState("");

  const asset = ASSETS.find((a) => a.id === assetId);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!assetId || !toLoc) {
      toast.error("Select an asset and destination");
      return;
    }
    toast.success(`${assetId} transfer created · to ${toLoc}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight size={18} />
            Create Transfer
          </DialogTitle>
          <DialogDescription>
            Move an asset to a new location and custodian.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">
              Need to move several assets? Use the transfer register for bulk
              moves.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From location</Label>
              <Input
                disabled
                placeholder="—"
                value={asset?.loc ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label>To location</Label>
              <Select value={toLoc} onValueChange={setToLoc}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {FA_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>New custodian</Label>
            <Select value={custodian} onValueChange={setCustodian}>
              <SelectTrigger>
                <SelectValue placeholder="Select custodian" />
              </SelectTrigger>
              <SelectContent>
                {FA_PEOPLE.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input
              placeholder="e.g. Reassignment to project team"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            Moves within the same cost center are auto-approved. Cross-cost-center
            transfers route to the PIC + Finance.
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
            Create transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
