import { Badge } from "@/components/ui/badge";

export type DiscrepancyStatusType =
  | "MATCHED"
  | "MISSING"
  | "UNEXPECTED"
  | "NOT_RECORDED";

export interface DiscrepancyStatusBadgeProps {
  status: DiscrepancyStatusType;
  className?: string;
  customText?: string;
}

const statusConfig: Record<
  DiscrepancyStatusType,
  { bgColor: string; text: string; textColor: string }
> = {
  MATCHED: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    text: "Matched",
    textColor: "text-emerald-700",
  },
  MISSING: {
    bgColor: "bg-red-50 border border-red-200",
    text: "Missing",
    textColor: "text-red-700",
  },
  NOT_RECORDED: {
    bgColor: "bg-slate-50 border border-slate-200",
    text: "Not Registered",
    textColor: "text-slate-700",
  },
  UNEXPECTED: {
    bgColor: "bg-amber-50 border border-amber-200",
    text: "Extra Item",
    textColor: "text-amber-700",
  },
};

const DiscrepancyStatusBadge = ({ status, className, customText }: DiscrepancyStatusBadgeProps) => {
  const config = statusConfig[status];

  const displayText = customText || config.text;

  return (
    <Badge
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${config.bgColor} ${config.textColor} hover:opacity-80 ${className || ""}`}
    >
      {displayText}
    </Badge>
  );
};

export default DiscrepancyStatusBadge;
