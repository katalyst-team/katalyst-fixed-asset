"use client";

import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import {
  useConnectIntegrationMutation,
  useGetFASettingsQuery,
} from "@/hooks/api/fixed-assets";
import type { FaIntegrationConnectType } from "@/modules/dashboard/fixed-assets/modals/types";

interface IntegrationConfigModalProps {
  onClose: () => void;
  open: boolean;
  payloadIntegration?: { key: string; name: string; type: FaIntegrationConnectType };
}

const FIELDS_BY_TYPE: Record<
  FaIntegrationConnectType,
  { key: string; labelKey: string }[]
> = {
  "active-directory": [
    { key: "host", labelKey: "modals.integrationConfig.fields.host" },
    { key: "bind_dn", labelKey: "modals.integrationConfig.fields.bindDn" },
  ],
  email: [
    { key: "smtp_host", labelKey: "modals.integrationConfig.fields.smtpHost" },
    { key: "api_key", labelKey: "modals.integrationConfig.fields.apiKey" },
  ],
  erp: [
    { key: "base_url", labelKey: "modals.integrationConfig.fields.baseUrl" },
    { key: "api_key", labelKey: "modals.integrationConfig.fields.apiKey" },
  ],
};

export function IntegrationConfigModal({
  onClose,
  open,
  payloadIntegration,
}: IntegrationConfigModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isConnecting, mutateAsync: connectAsync } =
    useConnectIntegrationMutation({ organizationId });
  const { data: settingsResp } = useGetFASettingsQuery({ organizationId });

  const fields = payloadIntegration ? FIELDS_BY_TYPE[payloadIntegration.type] : [];
  const savedConfig = payloadIntegration
    ? settingsResp?.data?.integrations?.[payloadIntegration.key]?.config
    : undefined;

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && payloadIntegration) {
      const initial: Record<string, string> = {};
      for (const f of FIELDS_BY_TYPE[payloadIntegration.type]) {
        initial[f.key] = savedConfig?.[f.key] ?? "";
      }
      setValues(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payloadIntegration?.key]);

  if (!payloadIntegration) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      await connectAsync({ data: { config: values }, type: payloadIntegration.type });
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {t("modals.integrationConfig.title", { name: payloadIntegration.name })}
          </DialogTitle>
          <DialogDescription>
            {t("modals.integrationConfig.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {fields.map((f) => (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={`int-${f.key}`}>{t(f.labelKey)}</Label>
              <Input
                id={`int-${f.key}`}
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            {t("modals.integrationConfig.cancel")}
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isConnecting}
            type="button"
            onClick={handleSubmit}
          >
            {isConnecting
              ? t("modals.integrationConfig.connecting")
              : t("modals.integrationConfig.connect")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
