"use client";

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
import { useCreatePmRuleMutation } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";

interface PmRuleModalProps {
  onClose: () => void;
  open: boolean;
}

const TRIGGERS = [
  "Insurance expiry",
  "Odometer / km",
  "Time interval",
  "Usage · cycles",
  "Usage · run-hours",
  "Warranty expiry",
];

const INTERVALS = [
  "1,000 run-hours",
  "180 days",
  "30 days",
  "365 days",
  "500 cycles",
  "5,000 km",
  "90 days",
];

const ASSIGNEES = [
  "Auto-dispatch vendor",
  "Facilities",
  "IT Helpdesk",
  "Lab Manager",
  "Maintenance Team",
  "Med Engineering",
  "Safety Officer",
];

export function PmRuleModal({ onClose, open }: PmRuleModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { mutateAsync } = useCreatePmRuleMutation({ organizationId });
  const [assignTo, setAssignTo] = useState("Maintenance Team");
  const [intervalValue, setIntervalValue] = useState("30 days");
  const [name, setName] = useState("");
  const [remindAt, setRemindAt] = useState("14d · 7d · 1d");
  const [trigger, setTrigger] = useState("Time interval");

  const isValid = name.trim().length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    await mutateAsync({
      autoWO: true,
      name: name.trim(),
      remind: remindAt,
      scope: assignTo,
      trigger: `${trigger} · ${intervalValue}`,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New reminder rule</DialogTitle>
          <DialogDescription>
            Auto-creates work orders and sends reminders on the configured
            trigger
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label isRequired htmlFor="pm-name">
              Rule name
            </Label>
            <Input
              id="pm-name"
              placeholder="e.g. Generator monthly load test"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pm-trigger">Trigger type</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger id="pm-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((tr) => (
                    <SelectItem key={tr} value={tr}>
                      {tr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pm-interval">Interval</Label>
              <Select
                value={intervalValue}
                onValueChange={setIntervalValue}
              >
                <SelectTrigger id="pm-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((itv) => (
                    <SelectItem key={itv} value={itv}>
                      {itv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pm-remind">Remind at</Label>
            <Input
              id="pm-remind"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lead times before due, separated by ·
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pm-assign">Assign to</Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger id="pm-assign">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNEES.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
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
            className={cn("ks-btn ks-btn-primary", !isValid && "opacity-50")}
            disabled={!isValid}
            type="button"
            onClick={handleSubmit}
          >
            Create rule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
