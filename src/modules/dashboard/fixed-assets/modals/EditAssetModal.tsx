"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { FA_LOCATIONS, FA_PEOPLE } from "@/modules/dashboard/fixed-assets/modals/types";
import type { FaAsset } from "@/types/fixed-assets";

interface EditAssetModalProps {
  asset: FaAsset | null;
  onClose: () => void;
  open: boolean;
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "Checked Out", value: "checked-out" },
  { label: "Deployed", value: "deployed" },
  { label: "Idle", value: "idle" },
  { label: "In Service", value: "in-service" },
  { label: "Maintenance", value: "maint" },
  { label: "Retired", value: "retired" },
];

export function EditAssetModal({ asset, onClose, open }: EditAssetModalProps) {
  const [custodian, setCustodian] = useState<string>(asset?.custodian ?? "");
  const [loc, setLoc] = useState<string>(asset?.loc ?? "");
  const [name, setName] = useState<string>(asset?.name ?? "");
  const [status, setStatus] = useState<string>(asset?.status ?? "deployed");

  useEffect(() => {
    if (!asset) return;
    setCustodian(asset.custodian);
    setLoc(asset.loc);
    setName(asset.name);
    setStatus(asset.status);
  }, [asset]);

  const custodianOptions = useMemo(() => {
    if (!asset) return FA_PEOPLE;
    const list = [...FA_PEOPLE];
    if (asset.custodian && !list.includes(asset.custodian)) {
      list.unshift(asset.custodian);
    }
    return list;
  }, [asset]);

  const locationOptions = useMemo(() => {
    if (!asset) return FA_LOCATIONS;
    const list = [...FA_LOCATIONS];
    if (asset.loc && !list.includes(asset.loc)) {
      list.unshift(asset.loc);
    }
    return list;
  }, [asset]);

  function handleSave() {
    if (!asset) return;
    if (!name.trim()) {
      toast.error("Asset name is required");
      return;
    }
    toast.success(`Asset updated · ${asset.id}`);
    onClose();
  }

  if (!open || !asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit asset · {asset.id}</DialogTitle>
          <DialogDescription>
            Changes are versioned in the audit log
          </DialogDescription>
        </DialogHeader>

        <div className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2")}>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="ea-name">Asset name</Label>
            <Input
              id="ea-name"
              placeholder="Asset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ea-custodian">Custodian</Label>
            <Select value={custodian} onValueChange={setCustodian}>
              <SelectTrigger id="ea-custodian">
                <SelectValue placeholder="Select custodian" />
              </SelectTrigger>
              <SelectContent>
                {custodianOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ea-location">Location</Label>
            <Select value={loc} onValueChange={setLoc}>
              <SelectTrigger id="ea-location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ea-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="ea-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ea-serial">Serial number</Label>
            <Input disabled={true} id="ea-serial" value={asset.serial} />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:col-span-2">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              EPC {asset.epc} is locked to this asset. Re-tag via RFID Tags →
              Print if the physical tag is damaged.
            </span>
          </div>
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            type="button"
            onClick={handleSave}
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
