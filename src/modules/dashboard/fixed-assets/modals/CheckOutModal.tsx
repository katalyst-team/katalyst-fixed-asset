import { LogOut, ScanLine } from "lucide-react";
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
import { FA_PEOPLE } from "@/modules/dashboard/fixed-assets/modals/types";
import { ASSETS } from "@/services/fixed-assets/mock";

const DUE_OPTIONS = ["1 day", "3 days", "7 days", "14 days", "30 days"];

const ELIGIBLE = ASSETS.filter(
  (a) => a.status === "deployed" || a.status === "idle",
);

interface CheckOutModalProps {
  onClose: () => void;
  open: boolean;
}

export function CheckOutModal({ onClose, open }: CheckOutModalProps) {
  const [assetId, setAssetId] = useState("");
  const [borrower, setBorrower] = useState("");
  const [due, setDue] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!assetId || !borrower) {
      toast.error("Select an asset and borrower");
      return;
    }
    const firstName = borrower.split(" ")[0];
    toast.success(`${assetId} checked out to ${firstName}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut size={18} />
            Check-Out · Asset Loan
          </DialogTitle>
          <DialogDescription>
            Loan a tool or device with RFID custody tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <ScanLine className="mt-0.5 shrink-0 text-muted-foreground" size={16} />
            <p className="text-xs text-muted-foreground">
              At a crib gate? Scanning the tag + badge fills this form
              automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset (idle / deployed)" />
              </SelectTrigger>
              <SelectContent>
                {ELIGIBLE.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Borrower</Label>
            <Select value={borrower} onValueChange={setBorrower}>
              <SelectTrigger>
                <SelectValue placeholder="Select borrower" />
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
            <Label>Due back</Label>
            <Select value={due} onValueChange={setDue}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DUE_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Defaults: tools 7d · IT loaner 30d
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Purpose (optional)</Label>
            <Input
              placeholder="e.g. Site survey at BDG-WH"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Borrowers receive a reminder 24h before the due date and daily
            overdue alerts until the asset is returned.
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
            Check out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
