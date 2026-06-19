"use client";

import { format } from "date-fns";
import { enUS, id } from "date-fns/locale";
import { Building2, Calendar, Mail, Phone, Shield, User } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import { useActiveLicenseQuery } from "@/hooks/api/license/useActiveLicenseQuery";
import { convertToTitleCase } from "@/utils/text";

import ProfileInfoItem from "./ProfileInfoItem";

interface ProfileInfoCardProps {
  fullName: string;
  initials: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  fullName,
  initials,
  email,
  phone,
  role,
  accountStatus,
}) => {
  const { t, i18n } = useTranslation("profile");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data } = useActiveLicenseQuery({ organizationId });

  const licenseData = data?.data;
  const expiredDate = licenseData?.expired_date;

  const formattedExpiredDate = React.useMemo(() => {
    if (!expiredDate) return "-";
    const locale = i18n.language === "id" ? id : enUS;
    return format(new Date(expiredDate), "d MMMM yyyy", { locale });
  }, [expiredDate, i18n.language]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{fullName}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="space-y-4">
          <ProfileInfoItem
            icon={User}
            label={t("fields.fullName")}
            value={fullName}
          />
          <ProfileInfoItem
            icon={Mail}
            label={t("fields.email")}
            value={email}
          />
          <ProfileInfoItem
            icon={Phone}
            label={t("fields.phone")}
            value={phone || "-"}
          />
          <ProfileInfoItem
            icon={Shield}
            label={t("fields.role")}
            value={
              <Badge variant="secondary">{convertToTitleCase(role)}</Badge>
            }
          />
          <ProfileInfoItem
            icon={Building2}
            label={t("fields.accountStatus")}
            value={
              <Badge
                variant={accountStatus === "ACTIVE" ? "default" : "secondary"}
              >
                {convertToTitleCase(accountStatus)}
              </Badge>
            }
          />
          <ProfileInfoItem
            icon={Calendar}
            label={t("fields.licenseExpiry")}
            value={formattedExpiredDate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;
