import { format } from "date-fns";
import {
  BadgeCheck,
  Clock3,
  OctagonX,
  RotateCcw,
  Send,
  ShieldAlert,
  Undo,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { ComponentType } from "react";

import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificationLogAction, VerificationLogEntry } from "@/types/verification";

interface VerificationLogTimelineProps {
  logs?: VerificationLogEntry[] | null;
  namespace: "detail-inbound-outbound" | "stock-audit";
}

const defaultStyle = {
  accentClassName: "border-l-slate-400",
  dotClassName: "bg-slate-500",
  icon: BadgeCheck,
  iconClassName: "text-slate-500",
} as const;

const actionVariantMap: Partial<
  Record<VerificationLogAction, "default" | "destructive" | "outline" | "secondary">
> = {
  AUTO_VERIFIED: "secondary",
  CANCELLED: "destructive",
  REJECTED: "destructive",
  RESUBMITTED: "outline",
  REVOKED: "outline",
  SUBMITTED: "outline",
  VALIDATED: "default",
  VERIFIED: "default",
};

const actionStyleMap: Partial<
  Record<
    VerificationLogAction,
    {
      accentClassName: string;
      dotClassName: string;
      icon: ComponentType<{ className?: string }>;
      iconClassName: string;
    }
  >
> = {
  AUTO_VERIFIED: {
    accentClassName: "border-l-slate-400",
    dotClassName: "bg-slate-500",
    icon: BadgeCheck,
    iconClassName: "text-slate-500",
  },
  CANCELLED: {
    accentClassName: "border-l-gray-500",
    dotClassName: "bg-gray-500",
    icon: OctagonX,
    iconClassName: "text-gray-500",
  },
  REJECTED: {
    accentClassName: "border-l-red-500",
    dotClassName: "bg-red-500",
    icon: ShieldAlert,
    iconClassName: "text-red-500",
  },
  RESUBMITTED: {
    accentClassName: "border-l-amber-500",
    dotClassName: "bg-amber-500",
    icon: RotateCcw,
    iconClassName: "text-amber-500",
  },
  REVOKED: {
    accentClassName: "border-l-orange-500",
    dotClassName: "bg-orange-500",
    icon: Undo,
    iconClassName: "text-orange-500",
  },
  SUBMITTED: {
    accentClassName: "border-l-blue-500",
    dotClassName: "bg-blue-500",
    icon: Send,
    iconClassName: "text-blue-500",
  },
  VALIDATED: {
    accentClassName: "border-l-emerald-500",
    dotClassName: "bg-emerald-500",
    icon: BadgeCheck,
    iconClassName: "text-emerald-500",
  },
  VERIFIED: {
    accentClassName: "border-l-emerald-500",
    dotClassName: "bg-emerald-500",
    icon: BadgeCheck,
    iconClassName: "text-emerald-500",
  },
};

const formatDateTime = (value: string) => {
  try {
    return format(new Date(value), "yyyy-MM-dd HH:mm:ss");
  } catch {
    return value;
  }
};

const getStatusKey = (value: string | null) => {
  if (!value) return null;
  return value.toLowerCase();
};

const getStatusLabel = (
  t: ReturnType<typeof useTranslation>["t"],
  value: string | null,
) => {
  const statusKey = getStatusKey(value);

  if (!statusKey || !value) {
    return t("verificationLog.notAvailable");
  }

  return t(`verificationLog.statuses.${statusKey}`, {
    defaultValue: value,
  });
};

const VerificationLogTimeline: React.FC<VerificationLogTimelineProps> = ({
  logs,
  namespace,
}) => {
  const { t } = useTranslation(namespace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("verificationLog.title")}</CardTitle>
        <CardDescription>{t("verificationLog.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <EmptyState
            description={t("verificationLog.empty.description")}
            title={t("verificationLog.empty.title")}
          />
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => {
              const actionStyle = actionStyleMap[log.action] ?? defaultStyle;
              const ActionIcon = actionStyle.icon;

              return (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-3 w-3 rounded-full ${actionStyle.dotClassName}`} />
                    {index < logs.length - 1 ? (
                      <div className="mt-2 min-h-16 w-px flex-1 bg-border" />
                    ) : null}
                  </div>

                  <div
                    className={`flex-1 rounded-lg border border-l-4 p-4 ${actionStyle.accentClassName}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ActionIcon className={`h-4 w-4 ${actionStyle.iconClassName}`} />
                          <Badge variant={actionVariantMap[log.action] ?? "secondary"}>
                            {t(`verificationLog.actions.${log.action}`)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("verificationLog.transition", {
                            from: getStatusLabel(t, log.from_status),
                            to: getStatusLabel(t, log.to_status),
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t("verificationLog.labels.actor")}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {log.actor?.name || t("verificationLog.systemActor")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.actor?.email || t("verificationLog.systemDescription")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t("verificationLog.labels.note")}
                        </p>
                        <p className="mt-1 text-sm">
                          {log.note || t("verificationLog.notAvailable")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationLogTimeline;
