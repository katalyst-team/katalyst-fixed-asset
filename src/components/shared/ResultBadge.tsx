import { Badge } from "@/components/ui/badge";

export type ResultType = "CONSISTENT" | "MISMATCH" | "UNKNOWN";

export interface ResultBadgeProps {
  result: ResultType;
  className?: string;
  customText?: string;
}

const resultConfig: Record<
  ResultType,
  { bgColor: string; text: string; textColor: string }
> = {
  CONSISTENT: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    text: "Consistent",
    textColor: "text-emerald-700",
  },
  MISMATCH: {
    bgColor: "bg-red-50 border border-red-200",
    text: "Mismatch",
    textColor: "text-red-700",
  },
  UNKNOWN: {
    bgColor: "bg-slate-50 border border-slate-200",
    text: "Unknown",
    textColor: "text-slate-700",
  },
};

const ResultBadge = ({ result, className, customText }: ResultBadgeProps) => {
  const config = resultConfig[result];

  const displayText = customText || config.text;

  return (
    <Badge
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${config.bgColor} ${config.textColor} hover:opacity-80 ${className || ""}`}
    >
      {displayText}
    </Badge>
  );
};

export default ResultBadge;
