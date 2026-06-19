import { Badge } from "@/components/ui/badge";

export type StatusLiteral =
  | "WAITING_PRINT"
  | "WAITING_INBOUND"
  | "WAITING_OUTBOUND"
  | "WAITING"
  | "SUCCESS_INBOUND"
  | "SUCCESS_OUTBOUND"
  | "SUCCESS"
  | "FAILED_INBOUND"
  | "FAILED_OUTBOUND"
  | "FAILED";

export type StatusType = StatusLiteral | string;

export interface BadgeStatusProps {
  status: StatusType;
  className?: string;
  extText?: string;
}

type StatusConfig = { color: string; bgColor: string; text: string };

const statusConfig: Record<StatusLiteral, StatusConfig> = {
  FAILED: {
    bgColor: "bg-red-50 border border-red-200",
    color: "text-red-700",
    text: "Failed",
  },
  FAILED_INBOUND: {
    bgColor: "bg-red-50 border border-red-200",
    color: "text-red-700",
    text: "Failed Inbound",
  },
  FAILED_OUTBOUND: {
    bgColor: "bg-red-50 border border-red-200",
    color: "text-red-700",
    text: "Failed Outbound",
  },
  SUCCESS: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    color: "text-emerald-700",
    text: "Success",
  },
  SUCCESS_INBOUND: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    color: "text-emerald-700",
    text: "Success Inbound",
  },
  SUCCESS_OUTBOUND: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    color: "text-emerald-700",
    text: "Success Outbound",
  },
  WAITING: {
    bgColor: "bg-amber-50 border border-amber-200",
    color: "text-amber-700",
    text: "Waiting",
  },
  WAITING_INBOUND: {
    bgColor: "bg-amber-50 border border-amber-200",
    color: "text-amber-700",
    text: "Waiting Inbound",
  },
  WAITING_OUTBOUND: {
    bgColor: "bg-amber-50 border border-amber-200",
    color: "text-amber-700",
    text: "Waiting Outbound",
  },
  WAITING_PRINT: {
    bgColor: "bg-amber-50 border border-amber-200",
    color: "text-amber-700",
    text: "Waiting Print",
  },
};

const BadgeStatus = ({ status, className, extText }: BadgeStatusProps) => {
  const normalizedStatus = status?.toUpperCase().replace(/\s+/g, "_");
  const config =
    (normalizedStatus &&
      statusConfig[normalizedStatus as StatusLiteral]) ||
    undefined;

  const formatStatusText = (value: string) =>
    value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const fallbackText =
    normalizedStatus && normalizedStatus.length > 0
      ? formatStatusText(normalizedStatus)
      : "Unknown";

  const displayText = extText
    ? `${config?.text ?? fallbackText} ${extText}`
    : config?.text ?? fallbackText;

  return (
    <Badge
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${config?.bgColor ?? "bg-slate-50 border border-slate-200"} ${config?.color ?? "text-slate-700"} hover:opacity-80 ${className || ""}`}
    >
      {displayText}
    </Badge>
  );
};

export default BadgeStatus;
