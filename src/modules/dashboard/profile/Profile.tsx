"use client";

import { useTranslation } from "next-i18next";

import { useUser } from "@/context/user-context";
import { useBypassHardware } from "@/hooks/useBypassHardware";

import { AccessSettingsCard, ChangePasswordCard, EditProfileCard, LicenseBanner, ProfileInfoCard } from "./components";

const Profile = () => {
  const { t } = useTranslation("profile");
  const { tokenPayload, stores } = useUser();
  const { isBypassEnabled, setBypassEnabled } = useBypassHardware();

  if (!tokenPayload) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  const fullName = `${tokenPayload.first_name} ${tokenPayload.last_name}`;
  const initials =
    `${tokenPayload.first_name.charAt(0)}${tokenPayload.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold font-heading tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* License Banner */}
      <LicenseBanner />

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfoCard
          accountStatus={tokenPayload.account_status}
          email={tokenPayload.email}
          fullName={fullName}
          initials={initials}
          phone={tokenPayload.phone}
          role={tokenPayload.role}
        />

        <EditProfileCard />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AccessSettingsCard
          isBypassEnabled={isBypassEnabled}
          permissions={tokenPayload.permissions || []}
          stores={stores || []}
          onBypassChange={setBypassEnabled}
        />

        <ChangePasswordCard />
      </div>
    </div>
  );
};

export default Profile;
