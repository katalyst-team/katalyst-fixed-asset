"use client";

import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { convertToTitleCase } from "@/utils/text";

interface Store {
  id: string;
  name: string;
}

interface Permission {
  id: string;
  name: string;
}

interface AccessSettingsCardProps {
  stores: Store[];
  permissions: Permission[];
  isBypassEnabled: boolean;
  onBypassChange: (enabled: boolean) => void;
}

const AccessSettingsCard: React.FC<AccessSettingsCardProps> = ({
  stores,
  permissions,
  isBypassEnabled,
  onBypassChange,
}) => {
  const { t } = useTranslation("profile");

  const hasStores = stores?.length > 0;
  const hasPermissions = permissions?.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("accessSettings.title")}</CardTitle>
        <CardDescription>{t("accessSettings.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stores */}
        {hasStores && (
          <div>
            <p className="text-sm font-medium mb-2">{t("stores.title")}</p>
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <Badge key={store.id} className="py-1 px-2.5" variant="secondary">
                  {store.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Permissions */}
        {hasPermissions && (
          <div>
            <p className="text-sm font-medium mb-2">{t("permissions.title")}</p>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission.id} variant="outline">
                  {convertToTitleCase(permission.name)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(hasStores || hasPermissions) && <Separator />}

        {/* Settings Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium" htmlFor="bypass-hardware">
              {t("developerSettings.bypassHardware.label")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("developerSettings.bypassHardware.description")}
            </p>
          </div>
          <Switch
            checked={isBypassEnabled}
            id="bypass-hardware"
            onCheckedChange={onBypassChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessSettingsCard;
