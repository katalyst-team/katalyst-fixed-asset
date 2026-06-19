import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TransferHistoryModalProps {
  onClose: () => void;
  open: boolean;
}

interface TransferRow {
  by: string;
  from: string;
  id: string;
  name: string;
  to: string;
  when: string;
}

const ROWS: TransferRow[] = [
  {
    by: "Dewi A.",
    from: "JKT-HQ · Floor 8",
    id: "MUT-2410-0142",
    name: "8 MacBook Pro · IT batch",
    to: "BDG-Office · Floor 2",
    when: "Today · 09:14",
  },
  {
    by: "Andi P.",
    from: "JKT-WH · Bay 2",
    id: "MUT-2410-0141",
    name: "Toyota Hilux Forklift",
    to: "BDG-WH · Bay 1",
    when: "Today · 08:02",
  },
  {
    by: "Facilities",
    from: "JKT · Lobby",
    id: "MUT-2410-0140",
    name: "24 Aeron Chairs",
    to: "JKT-HQ · Floor 12",
    when: "Yesterday · 16:40",
  },
  {
    by: "Dr. Ratna",
    from: "BDG-Lab",
    id: "MUT-2410-0139",
    name: "Mettler PH Meter",
    to: "JKT-Lab · Station 3",
    when: "Yesterday · 11:18",
  },
  {
    by: "Med Eng",
    from: "RS · ICU-2",
    id: "MUT-2410-0136",
    name: "Philips IntelliVue MX450",
    to: "RS · OR-3",
    when: "2 days ago · 14:22",
  },
  {
    by: "Eko P.",
    from: "Mfg-1 · Cell A",
    id: "MUT-2410-0134",
    name: "Mazak QTN-200 CNC",
    to: "Mfg-2 · Cell B",
    when: "3 days ago · 07:50",
  },
];

export function TransferHistoryModal({
  onClose,
  open,
}: TransferHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transfer history · last 30 days</DialogTitle>
          <DialogDescription>
            All completed transfers · receipt confirmed by destination gate scan
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Transfer</th>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Completed</th>
                <th className="py-2 pl-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.id}
                  className={cn("border-b border-border/60", "last:border-0")}
                >
                  <td className="py-3 pr-3">
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {row.id}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {row.from}
                      <ArrowRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          "text-foreground",
                        )}
                      />
                      {row.to}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {row.when}
                  </td>
                  <td className="py-3 pl-3 text-muted-foreground">{row.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
