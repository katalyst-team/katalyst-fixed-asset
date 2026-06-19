import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";

interface StatusBadgeItemProps {
  count: number;
  namespace: string;
  status: string;
}

const StatusBadgeItem = ({ count, namespace, status }: StatusBadgeItemProps) => {
  const { BadgeComponent } = useBadgeStatus(status, {
    extText: `(${count})`,
    translationNamespace: namespace,
  });

  return <>{BadgeComponent}</>;
};

interface VerificationStatusBadgeProps {
  namespace?: string;
  statusCounts?: Record<string, number>;
  verificationStatus?: string;
}

const badgeStyles: Record<string, string> = {
  CANCELLED: "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  DRAFT: "border-transparent bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  REJECTED: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  SUBMITTED: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  VALIDATED: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VERIFIED: "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const VerificationStatusBadge = ({
  namespace = "common",
  statusCounts = {},
  verificationStatus,
}: VerificationStatusBadgeProps) => {
  const { t } = useTranslation("common");

  if (verificationStatus && badgeStyles[verificationStatus]) {
    return (
      <Badge className={badgeStyles[verificationStatus]}>
        {t(`verificationStatus.${verificationStatus.toLowerCase()}`)}
      </Badge>
    );
  }

  if (Object.keys(statusCounts).length === 0) {
    return <span className="text-muted-foreground">{t("verificationStatus.noStatus")}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(statusCounts).map(([status, count]) => (
        <StatusBadgeItem key={status} count={count} namespace={namespace} status={status} />
      ))}
    </div>
  );
};

export default VerificationStatusBadge;
