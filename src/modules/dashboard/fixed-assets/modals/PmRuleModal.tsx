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
import { useFaPeopleOptions } from "@/modules/dashboard/fixed-assets/modals/types";

interface PmRuleModalProps {
  onClose: () => void;
  open: boolean;
}

const TRIGGER_TYPES = [
  { label: "Time interval (days)", value: "days" },
  { label: "Usage · run-hours", value: "run-hours" },
  { label: "Usage · cycles", value: "cycles" },
];

export function PmRuleModal({ onClose, open }: PmRuleModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { mutateAsync } = useCreatePmRuleMutation({ organizationId });
  const peopleOptions = useFaPeopleOptions();
  const [assignTo, setAssignTo] = useState("");
  const [intervalValue, setIntervalValue] = useState("30");
  const [name, setName] = useState("");
  const [remindAt, setRemindAt] = useState("14, 7, 1");
  const [triggerType, setTriggerType] = useState("days");

  const parsedInterval = parseInt(intervalValue, 10);
  const parsedReminders = remindAt
    .split(/[,\s·]+/)
    .map((part) => parseInt(part, 10))
    .filter((days) => !Number.isNaN(days) && days > 0);
  const isValid =
    name.trim().length > 0 &&
    !Number.isNaN(parsedInterval) &&
    parsedInterval >= 1 &&
    assignTo.length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    await mutateAsync({
      auto_wo: true,
      name: name.trim(),
      reminder_days: parsedReminders,
      scope: assignTo,
      trigger_type: triggerType,
      trigger_value: parsedInterval,
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
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger id="pm-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((tr) => (
                    <SelectItem key={tr.value} value={tr.value}>
                      {tr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pm-interval">Interval value</Label>
              <Input
                id="pm-interval"
                inputMode="numeric"
                min={1}
                placeholder="30"
                type="number"
                value={intervalValue}
                onChange={(e) => setIntervalValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Amount per trigger type (e.g. every 30 days)
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pm-remind">Remind at</Label>
            <Input
              id="pm-remind"
              placeholder="14, 7, 1"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lead times before due (days), separated by commas
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pm-assign">Assign to</Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger id="pm-assign">
                <SelectValue placeholder="Select custodian" />
              </SelectTrigger>
              <SelectContent>
                {peopleOptions.map((person) => (
                  <SelectItem key={person.value} value={person.value}>
                    {person.label}
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
