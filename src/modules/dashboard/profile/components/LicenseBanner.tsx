import { format } from "date-fns";
import { enUS,id } from "date-fns/locale";
import { Calendar, Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { useActiveLicenseQuery } from "@/hooks/api/license/useActiveLicenseQuery";

export function LicenseBanner() {
  const { t, i18n } = useTranslation("profile");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data, isLoading } = useActiveLicenseQuery({ organizationId });

  const licenseData = data?.data;
  const expiredDate = licenseData?.expired_date;

  const daysUntilExpiry = React.useMemo(() => {
    if (!expiredDate) return 0;
    const expiry = new Date(expiredDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [expiredDate]);

  const formattedDate = React.useMemo(() => {
    if (!expiredDate) return "";
    const locale = i18n.language === "id" ? id : enUS;
    return format(new Date(expiredDate), "d MMMM yyyy", { locale });
  }, [expiredDate, i18n.language]);

  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  if (isLoading) {
    return (
      <Card className="ks-card">
        <div className="ks-card-body">
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  if (!expiredDate) {
    return null;
  }

  const getMessage = () => {
    if (isExpired) {
      return {
        icon: Info,
        message: t("license.expiredMessage", "Akses layanan Anda mungkin terbatas. Hubungi tim kami untuk perpanjangan."),
        title: t("license.expired", "Langganan telah berakhir"),
        tone: "danger" as const,
      };
    }

    if (isExpiringSoon) {
      return {
        icon: Calendar,
        message: t(
          "license.expiringSoonMessage",
          "Langganan Anda berakhir pada {{date}}. Kami senang untuk membantu Anda melanjutkan layanan.",
          { date: formattedDate },
        ),
        title: t("license.expiringSoon", "Langganan akan segera berakhir"),
        tone: "warn" as const,
      };
    }

    return {
      icon: Calendar,
      message: t("license.validMessage", "Langganan Anda berlaku hingga {{date}}.", { date: formattedDate }),
      title: t("license.valid", "Langganan aktif"),
      tone: "info" as const,
    };
  };

  const { tone, icon: Icon, title, message } = getMessage();

  const toneStyles = {
    danger: {
      bg: "hsl(var(--danger-soft))",
      border: "hsl(var(--destructive) / 0.2)",
      icon: "hsl(var(--destructive))",
      text: "hsl(var(--destructive))",
    },
    info: {
      bg: "hsl(var(--info-soft))",
      border: "hsl(var(--info) / 0.2)",
      icon: "hsl(var(--info))",
      text: "hsl(var(--text-1))",
    },
    warn: {
      bg: "hsl(var(--warn-soft))",
      border: "hsl(var(--warn) / 0.2)",
      icon: "hsl(var(--warn))",
      text: "hsl(var(--text-1))",
    },
  };

  const style = toneStyles[tone];

  return (
    <Card
      className="ks-card"
      style={{
        background: style.bg,
        borderColor: style.border,
      }}
    >
      <div className="ks-card-body" style={{ alignItems: "center", display: "flex", gap: "var(--space-3)" }}>
        <div
          style={{
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            display: "flex",
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          <Icon size={20} style={{ color: style.icon }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: style.text, fontSize: "0.875rem", fontWeight: 600, marginBottom: 2 }}>
            {title}
          </div>
          <div style={{ color: style.text, fontSize: "0.75rem", opacity: 0.85 }}>{message}</div>
        </div>
      </div>
    </Card>
  );
}
