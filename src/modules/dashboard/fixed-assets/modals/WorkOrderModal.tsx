"use client";

import { Wrench } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import {
  useCreateWorkOrderMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";

interface WorkOrderModalProps {
  onClose: () => void;
  open: boolean;
}

const ASSIGN_OPTIONS = [
  "Andi Pratama",
  "Auto-dispatch vendor",
  "Eko Pranata",
  "Facilities",
  "Galang Tirta",
  "IT Ops",
  "Med Engineering",
];

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

const SOURCE_OPTIONS = [
  "Audit · variance investigation",
  "Corrective · breakdown / damage report",
  "Disposal · pickup & scan-out",
  "Inspection · pre-use check failed",
  "PM · scheduled maintenance",
  "Transfer · move request",
];

export function WorkOrderModal({ onClose, open }: WorkOrderModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createWO } = useCreateWorkOrderMutation({
    organizationId,
  });
  const assets = resp?.data ?? [];
  const [assetId, setAssetId] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>(ASSIGN_OPTIONS[0]);
  const [issue, setIssue] = useState<string>("");
  const [priority, setPriority] = useState<string>("Medium");
  const [source, setSource] = useState<string>(SOURCE_OPTIONS[1]);

  async function handleSubmit() {
    if (!issue.trim()) {
      toast.error("Describe the issue before creating the work order");
      return;
    }
    await createWO({
      asset_id: assetId,
      assigned_to: assignedTo,
      desc: issue,
      priority: priority.toLowerCase() as "critical" | "high" | "medium" | "low",
      type: "corrective",
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create work order</DialogTitle>
          <DialogDescription>
            Dispatch a corrective, PM, or transfer task to a custodian or vendor.
          </DialogDescription>
        </DialogHeader>

        <div className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2")}>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="wo-asset">Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger id="wo-asset">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-source">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="wo-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wo-priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="wo-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="wo-issue">Issue description</Label>
            <Textarea
              id="wo-issue"
              placeholder="What's wrong / what needs to happen?"
              rows={3}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="wo-assign">Assign to</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="wo-assign">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGN_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onClick={handleSubmit}
          >
            <Wrench className="h-3.5 w-3.5" />
            Create WO
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
