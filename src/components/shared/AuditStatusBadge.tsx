import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";

export type AuditStatusType = "EXCESS" | "MATCH" | "MISMATCH" | "MISPLACED";

export interface AuditStatusBadgeProps {
  auditStatus: AuditStatusType;
  className?: string;
}

const statusConfig: Record<
  AuditStatusType,
  { bgColor: string; icon: string; text: string; textColor: string }
> = {
  EXCESS: {
    bgColor: "bg-amber-50 border border-amber-200",
    icon: "＋",
    text: "Excess",
    textColor: "text-amber-700",
  },
  MATCH: {
    bgColor: "bg-emerald-50 border border-emerald-200",
    icon: "✓",
    text: "Match",
    textColor: "text-emerald-700",
  },
  MISMATCH: {
    bgColor: "bg-red-50 border border-red-200",
    icon: "✕",
    text: "Mismatch",
    textColor: "text-red-700",
  },
  MISPLACED: {
    bgColor: "bg-amber-50 border border-amber-200",
    icon: "⚠",
    text: "Misplaced",
    textColor: "text-amber-700",
  },
};

const AuditStatusBadge = ({ auditStatus, className }: AuditStatusBadgeProps) => {
  const { t } = useTranslation("stock-audit");
  const config = statusConfig[auditStatus];

  const displayText = t(`auditStatus.${auditStatus.toLowerCase()}`, config.text);

  return (
    <Badge
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${config.bgColor} ${config.textColor} hover:opacity-80 ${className || ""}`}
    >
      <span className="mr-1">{config.icon}</span>
      {displayText}
    </Badge>
  );
};

export default AuditStatusBadge;
