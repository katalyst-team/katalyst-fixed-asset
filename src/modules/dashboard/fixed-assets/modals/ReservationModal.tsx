import { CalendarClock } from "lucide-react";
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

const DURATIONS = ["2 hours", "4 hours", "Full day", "2 days", "1 week"];

const RESERVE_BY = [
  ...FA_PEOPLE,
  "Facilities",
  "HR Training",
  "Survey Team",
];

const START_TIMES = [
  "Today 13:00",
  "Tomorrow 08:00",
  "Tomorrow 13:00",
  "Thu 09:00",
  "Fri 09:00",
  "Fri 13:00",
  "Mon 08:00",
];

interface ReservationModalProps {
  onClose: () => void;
  open: boolean;
}

export function ReservationModal({ onClose, open }: ReservationModalProps) {
  const [assetId, setAssetId] = useState("");
  const [reserveBy, setReserveBy] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("");

  const asset = ASSETS.find((a) => a.id === assetId);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!assetId || !start) {
      toast.error("Select an asset and start time");
      return;
    }
    toast.success(`${asset?.name ?? assetId} reserved · ${start}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={18} />
            Reserve Asset
          </DialogTitle>
          <DialogDescription>
            Book a shared asset for a time window. It converts to a loan on
            pickup.
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
          </div>

          <div className="space-y-1.5">
            <Label>Reserved by</Label>
            <Select value={reserveBy} onValueChange={setReserveBy}>
              <SelectTrigger>
                <SelectValue placeholder="Select person or team" />
              </SelectTrigger>
              <SelectContent>
                {RESERVE_BY.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start time</Label>
              <Select value={start} onValueChange={setStart}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  {START_TIMES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            The reservation converts to a loan automatically on the pickup gate
            scan.
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
            Reserve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
