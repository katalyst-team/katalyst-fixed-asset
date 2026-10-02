"use client";

/* eslint-disable max-lines */

import type { LucideIcon } from "lucide-react";
import {
  Bell, BookOpen, Check, Database, DollarSign, Loader2, Mail, MessageSquare, Network, Plug, Printer, Radio, RefreshCw, Save, Settings as Cog, Shield,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import {
  useDisconnectIntegrationMutation,
  useGetBillingQuery,
  useGetFASettingsQuery,
  useGetInvoicesQuery,
  useGetMaintenanceQuery,
  useGetNotificationTriggersQuery,
  useGetRfidReadersQuery,
  useGetRFIDTagsQuery,
  useUpdateFASettingsMutation,
  useUpdateNotificationTriggersMutation,
} from "@/hooks/api/fixed-assets";
import { FaMeter, FaShellHead,formatDate } from "@/modules/dashboard/fixed-assets";
import { FaQueryError } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaSettings } from "@/types/fixed-assets";

const DEFAULT_SETTINGS: FaSettings = {
  depreciation: { default_useful_life_years: {}, method: "straight-line" },
  integrations: { accounting: { connected: false }, active_directory: { connected: false }, email_provider: { connected: false }, erp: { connected: false }, label_printers: { connected: false }, messaging: { connected: false } },
  notifications: { audit_complete_notify: false, disposal_approval_notify: false, email_enabled: false, maintenance_reminder_days: [], push_enabled: false },
  rfid_hardware: { default_tag_type: "", epc_encoding: "", reader_polling_interval_ms: 0, rssi_threshold: 0 },
  security: { ip_whitelist: [], mfa_required: false, password_policy: "", session_timeout_min: 0 },
  workspace: { asset_id_prefix: "", company_name: "", currency: "", depreciation_standard: "", fiscal_year_start: "", next_asset_number: 0, npwp: "" },
};

const NAV = [
  { icon: Cog, id: "general", labelKey: "page.settings.nav.general" },
  { icon: Bell, id: "notif", labelKey: "page.settings.nav.notif" },
  { icon: RefreshCw, id: "maint", labelKey: "page.settings.nav.maint" },
  { icon: Database, id: "integ", labelKey: "page.settings.nav.integ" },
  { icon: Radio, id: "rfid", labelKey: "page.settings.nav.rfid" },
  { icon: Shield, id: "security", labelKey: "page.settings.nav.security" },
  { icon: DollarSign, id: "billing", labelKey: "page.settings.nav.billing" },
];

function Field({ label, onChange, value }: { label: string; onChange: (v: string) => void; value: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600 }}>{label}</span>
      <input style={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", padding: "8px 11px" }} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function GeneralPanel({ onChange, organizationId, workspace }: {
  onChange: (patch: Partial<FaSettings["workspace"]>) => void;
  organizationId: string;
  workspace: FaSettings["workspace"];
}) {
  const { t } = useTranslation("fixed-assets");
  const { data: tagsResp } = useGetRFIDTagsQuery({ organizationId });
  const totalTagged = tagsResp?.data?.tags.length ?? 0;

  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.workspace")}</span></div>
      <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ks-grid-2" style={{ gap: 14 }}>
          <Field label={t("page.settings.companyName")} value={workspace.company_name} onChange={(v) => onChange({ company_name: v })} />
          <Field label={t("page.settings.npwp")} value={workspace.npwp} onChange={(v) => onChange({ npwp: v })} />
          <Field label={t("page.settings.currency")} value={workspace.currency} onChange={(v) => onChange({ currency: v })} />
          <Field label={t("page.settings.fiscalYearStart")} value={workspace.fiscal_year_start} onChange={(v) => onChange({ fiscal_year_start: v })} />
          <Field label={t("page.settings.depreciationStandard")} value={workspace.depreciation_standard} onChange={(v) => onChange({ depreciation_standard: v })} />
        </div>
        <div>
          <div style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>{t("page.settings.assetNumberingScheme")}</div>
          <div className="ks-grid-3" style={{ gap: 12 }}>
            {[
              { k: t("page.settings.numberingFormat"), v: workspace.asset_id_prefix },
              { k: t("page.settings.numberingNextSequence"), v: String(workspace.next_asset_number) },
              { k: t("page.settings.numberingTotalTagged"), v: totalTagged.toLocaleString("id-ID") },
            ].map((item) => (
              <div key={item.k} style={{ background: "hsl(var(--surface-2))", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{item.k}</div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 16, fontWeight: 600 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel({ notifications, organizationId }: { notifications: FaSettings["notifications"]; organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp } = useGetNotificationTriggersQuery({ organizationId });
  const { isPending: isUpdating, mutateAsync: updateTriggersAsync } = useUpdateNotificationTriggersMutation({ organizationId });
  const triggers = resp?.data?.triggers ?? [];
  const channels = [
    { name: "Email", on: notifications.email_enabled },
    { name: "WhatsApp", on: triggers.some((t) => t.channels.includes("wa")) },
    { name: "Slack", on: triggers.some((t) => t.channels.includes("slack")) },
  ];

  const handleToggleChannel = async (event: string, channel: string) => {
    const updated = triggers.map((t) => {
      if (t.event !== event) return t;
      const has = t.channels.includes(channel);
      return { ...t, channels: has ? t.channels.filter((c) => c !== channel) : [...t.channels, channel] };
    });
    await updateTriggersAsync({ triggers: updated });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.channels")}</span></div>
        <div className="ks-card-body">
          <div className="ks-grid-2" style={{ gap: 12 }}>
            {channels.map((c) => (
              <div key={c.name} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                {c.on ? <span className="ks-badge success">{t("page.settings.connected")}</span> : <span className="ks-badge outline">{t("page.settings.off")}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.triggers")}</span></div>
        <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.event")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.email")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.whatsapp")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.slack")}</th></tr></thead>
          <tbody>
            {triggers.map((t) => {
              const emailOn = t.channels.includes("email");
              const waOn = t.channels.includes("wa");
              const slackOn = t.channels.includes("slack");
              return (
                <tr key={t.event}>
                  <td className="border-t border-border p-3" style={{ fontWeight: 600 }}>{t.event}</td>
                  <td className="border-t border-border p-3"><button disabled={isUpdating} style={{ background: "transparent", border: 0, color: emailOn ? "hsl(var(--text))" : "hsl(var(--text-3))", cursor: "pointer" }} type="button" onClick={() => handleToggleChannel(t.event, "email")}>{emailOn ? <Check size={15} /> : <span>&mdash;</span>}</button></td>
                  <td className="border-t border-border p-3"><button disabled={isUpdating} style={{ background: "transparent", border: 0, color: waOn ? "hsl(var(--text))" : "hsl(var(--text-3))", cursor: "pointer" }} type="button" onClick={() => handleToggleChannel(t.event, "wa")}>{waOn ? <Check size={15} /> : <span>&mdash;</span>}</button></td>
                  <td className="border-t border-border p-3"><button disabled={isUpdating} style={{ background: "transparent", border: 0, color: slackOn ? "hsl(var(--text))" : "hsl(var(--text-3))", cursor: "pointer" }} type="button" onClick={() => handleToggleChannel(t.event, "slack")}>{slackOn ? <Check size={15} /> : <span>&mdash;</span>}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function MaintenancePanel({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp } = useGetMaintenanceQuery({ organizationId });
  const pmRules = resp?.data?.pm_rules ?? [];
  const upcoming = (resp?.data?.work_orders ?? [])
    .filter((w) => w.status === "open" || w.status === "in-progress")
    .sort((a, b) => a.eta.localeCompare(b.eta))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.reminderRules")}</span></div>
        <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.rule")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.trigger")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.leadTime")}</th></tr></thead>
          <tbody>
            {pmRules.map((r) => (
              <tr key={r.name}>
                <td className="border-t border-border p-3" style={{ fontWeight: 600 }}>{r.name}</td>
                <td className="border-t border-border p-3">{r.trigger}</td>
                <td className="border-t border-border p-3">{r.remind}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.upcoming")}</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcoming.map((w) => (
            <div key={w.id} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", gap: 10, padding: "9px 12px" }}>
              <span className="ks-badge warn">{w.eta}</span>
              <span style={{ fontSize: 13 }}>{w.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ponytail: connect endpoint whitelist (katalyst-core settingsKeyByType) only accepts
// these 3 — expand both maps together when the backend adds more types.
const CONNECT_TYPE_BY_KEY: Record<string, "active-directory" | "email" | "erp"> = {
  active_directory: "active-directory",
  email_provider: "email",
  erp: "erp",
};

const INTEGRATION_META: Record<string, { descKey: string; icon: LucideIcon; nameKey: string }> = {
  accounting: { descKey: "page.settings.integration.accountingDesc", icon: BookOpen, nameKey: "page.settings.integration.accounting" },
  active_directory: { descKey: "page.settings.integration.activeDirectoryDesc", icon: Network, nameKey: "page.settings.integration.activeDirectory" },
  email_provider: { descKey: "page.settings.integration.emailDesc", icon: Mail, nameKey: "page.settings.integration.email" },
  erp: { descKey: "page.settings.integration.erpDesc", icon: Database, nameKey: "page.settings.integration.erp" },
  label_printers: { descKey: "page.settings.integration.labelPrintersDesc", icon: Printer, nameKey: "page.settings.integration.labelPrinters" },
  messaging: { descKey: "page.settings.integration.messagingDesc", icon: MessageSquare, nameKey: "page.settings.integration.messaging" },
};

function IntegrationsPanel({ canManageSettings, integrations, isDisconnecting, onConnect, onDisconnect }: {
  canManageSettings: boolean;
  integrations: FaSettings["integrations"];
  isDisconnecting: boolean;
  onConnect: (key: string, name: string) => void;
  onDisconnect: (key: string) => Promise<void>;
}) {
  const { t } = useTranslation("fixed-assets");
  const cards = Object.entries(integrations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, state]) => {
      const meta = INTEGRATION_META[key] ?? { descKey: "page.settings.integration.genericDesc", icon: Plug, nameKey: "" };
      return { ...meta, connected: state?.connected === true, key };
    });

  return (
    <div className="ks-grid-3" style={{ gap: 14 }}>
      {cards.map((i) => {
        const Icon = i.icon;
        const connectType = CONNECT_TYPE_BY_KEY[i.key];
        const name = i.nameKey ? t(i.nameKey) : i.key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return (
          <div key={i.key} className="ks-card">
            <div className="ks-card-body" style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
              <div style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 10, display: "flex", height: 44, justifyContent: "center", width: 44 }}><Icon size={20} /></div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{t(i.descKey)}</div>
              {i.connected ? (
                <>
                  <span className="ks-badge success">{t("page.settings.connected")}</span>
                  {connectType && canManageSettings ? (
                    <button
                      className="ks-btn ks-btn-sm"
                      disabled={isDisconnecting}
                      type="button"
                      onClick={() => onDisconnect(i.key)}
                    >
                      {isDisconnecting ? <Loader2 className="animate-spin" size={14} /> : null}
                      {t("page.settings.disconnect")}
                    </button>
                  ) : null}
                </>
              ) : connectType && canManageSettings ? (
                <button
                  className="ks-btn ks-btn-sm"
                  type="button"
                  onClick={() => onConnect(i.key, name)}
                >
                  {t("page.settings.connect")}
                </button>
              ) : connectType ? <span className="ks-badge outline">{t("page.settings.available")}</span> : <span className="ks-badge outline">{t("page.settings.comingSoon")}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RfidPanel({ onChange, organizationId, rfidHardware }: {
  onChange: (patch: Partial<FaSettings["rfid_hardware"]>) => void;
  organizationId: string;
  rfidHardware: FaSettings["rfid_hardware"];
}) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp } = useGetRfidReadersQuery({ organizationId });
  const readers = resp?.data?.readers ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.hardwareConfig")}</span></div>
        <div className="ks-card-body">
          <div className="ks-grid-2" style={{ gap: 14 }}>
            <Field label={t("page.settings.readerPollingInterval")} value={String(rfidHardware.reader_polling_interval_ms)} onChange={(v) => onChange({ reader_polling_interval_ms: Number(v) || 0 })} />
            <Field label={t("page.settings.rssiThreshold")} value={String(rfidHardware.rssi_threshold)} onChange={(v) => onChange({ rssi_threshold: Number(v) || 0 })} />
            <Field label={t("page.settings.epcEncoding")} value={rfidHardware.epc_encoding} onChange={(v) => onChange({ epc_encoding: v })} />
            <Field label={t("page.settings.defaultTagType")} value={rfidHardware.default_tag_type} onChange={(v) => onChange({ default_tag_type: v })} />
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.readersCount", { count: readers.length })}</span></div>
        <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.name")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.location")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.model")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.ip")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.status")}</th></tr></thead>
          <tbody>
            {readers.map((r) => (
              <tr key={r.id}>
                <td className="border-t border-border p-3 font-medium">{r.name}</td>
                <td className="border-t border-border p-3">{r.location}</td>
                <td className="border-t border-border p-3">{r.model}</td>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{r.ip || "—"}</td>
                <td className="border-t border-border p-3">{r.status === "online" ? <span className="ks-badge success">{t("page.settings.statusOnline")}</span> : r.status === "error" ? <span className="ks-badge danger">{t("page.settings.statusError")}</span> : <span className="ks-badge danger">{t("page.settings.statusOffline")}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function SecurityPanel({ security }: { security: FaSettings["security"] }) {
  const { t } = useTranslation("fixed-assets");
  const rows = [
    { desc: t("page.settings.security.sessionTimeoutDesc"), title: t("page.settings.security.sessionTimeout"), val: t("page.settings.security.minutes", { count: security.session_timeout_min }) },
    { desc: t("page.settings.security.ipWhitelistDesc"), title: t("page.settings.security.ipWhitelist"), val: security.ip_whitelist.length > 0 ? security.ip_whitelist.join(", ") : t("page.settings.security.any") },
    { desc: t("page.settings.security.mfaRequirementDesc"), title: t("page.settings.security.mfaRequirement"), val: security.mfa_required ? t("page.settings.security.enforced") : t("page.settings.off") },
    { desc: t("page.settings.security.passwordPolicyDesc"), title: t("page.settings.security.passwordPolicy"), val: security.password_policy || t("page.settings.security.defaultPolicy") },
  ];

  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.nav.security")}</span></div>
      <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rows.map((r, i) => (
          <div key={r.title} style={{ alignItems: "center", borderBottom: i < rows.length - 1 ? "1px solid hsl(var(--border))" : "none", display: "flex", gap: 16, justifyContent: "space-between", padding: "14px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
              <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{r.desc}</div>
            </div>
            <span className="ks-badge outline">{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingPanel({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: billingResp } = useGetBillingQuery({ organizationId });
  const { data: invoicesResp } = useGetInvoicesQuery({ organizationId });
  const billing = billingResp?.data;
  const invoices = invoicesResp?.data?.invoices ?? [];

  if (!billing) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.plan")}</span><span className="ks-badge brand">{billing.plan}</span></div>
        <div className="ks-card-body ks-grid-3" style={{ gap: 14 }}>
          {[[t("page.settings.billing.plan"), billing.plan], [t("page.settings.billing.renewal"), formatDate(billing.renewal_date)], [t("page.settings.billing.seats"), `${billing.seats_used} / ${billing.seat_count}`]].map(([k, v]) => (
            <div key={k} style={{ background: "hsl(var(--surface-2))", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.usage")}</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { cur: billing.asset_count, label: t("page.settings.billing.assets"), max: billing.asset_limit, tone: "brand", unit: "" },
            { cur: billing.storage_used_mb, label: t("page.settings.billing.storage"), max: billing.storage_limit_mb, tone: "info", unit: " MB" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ alignItems: "center", display: "flex", fontSize: 13, justifyContent: "space-between", marginBottom: 5 }}>
                <span>{item.label}</span><span style={{ color: "hsl(var(--text-3))" }}>{item.cur} / {item.max}{item.unit}</span>
              </div>
              <FaMeter pct={item.max > 0 ? (item.cur / item.max) * 100 : 0} tone={item.tone} />
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">{t("page.settings.invoiceHistory")}</span></div>
        <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.invoice")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.amount")}</th><th className="p-3 text-left font-medium text-muted-foreground">{t("page.settings.columns.status")}</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="border-t border-border p-3">{formatDate(inv.date)}</td>
                <td className="border-t border-border p-3">{inv.amount}</td>
                <td className="border-t border-border p-3"><span className={`ks-badge ${inv.status === "paid" ? "success" : inv.status === "pending" ? "warn" : "danger"}`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export function FaSettingsPage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { canManageSettings } = useFaPermission();
  const [tab, setTab] = useState("general");
  const { data: resp, isError, isLoading, refetch } = useGetFASettingsQuery({ organizationId });
  const { isPending: isSaving, mutateAsync: updateSettingsAsync } = useUpdateFASettingsMutation({ organizationId });
  const { isPending: isDisconnecting, mutateAsync: disconnectAsync } = useDisconnectIntegrationMutation({ organizationId });
  const { openModal } = useFaModal();
  const settings = resp?.data;
  const [form, setForm] = useState<FaSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...prev,
        ...settings,
        depreciation: { ...prev.depreciation, ...settings.depreciation },
        integrations: { ...prev.integrations, ...settings.integrations },
        notifications: { ...prev.notifications, ...settings.notifications },
        rfid_hardware: { ...prev.rfid_hardware, ...settings.rfid_hardware },
        security: { ...prev.security, ...settings.security },
        workspace: { ...prev.workspace, ...settings.workspace },
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettingsAsync(form);
  };

  const handleConnect = (key: string, name: string) => {
    const type = CONNECT_TYPE_BY_KEY[key];
    if (!type) return;
    openModal("integrationConfig", { integration: { key, name, type } });
  };

  const handleDisconnect = async (key: string) => {
    const type = CONNECT_TYPE_BY_KEY[key];
    if (!type) return;
    await disconnectAsync({ type });
  };

  if (isLoading) return <Loading />;
  if (isError) return <FaQueryError onRetry={() => { refetch(); }} />;

  return (
    <div>
      <FaShellHead
        actions={
          canManageSettings ? (
            <button
              className="ks-btn ks-btn-primary"
              disabled={isSaving}
              type="button"
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {t("page.settings.saveChanges")}
            </button>
          ) : null
        }
        desc={t("page.settings.description")}
        title={t("page.settings.title")}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <div className="ks-card">
          <div style={{ display: "flex", flexDirection: "column", padding: 8 }}>
            {NAV.map((n) => {
              const Icon = n.icon;
              const on = n.id === tab;
              return (
                <button
                  key={n.id}
                  style={{
                    alignItems: "center", background: on ? "hsl(var(--brand-soft))" : "transparent", border: 0, borderRadius: 8, color: on ? "hsl(var(--brand))" : "hsl(var(--text-2))", cursor: "pointer", display: "flex", fontFamily: "inherit", fontSize: 13, fontWeight: on ? 600 : 500, gap: 9, padding: "9px 11px", textAlign: "left", width: "100%",
                  }}
                  type="button"
                  onClick={() => setTab(n.id)}
                >
                  <Icon size={15} />{t(n.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          {tab === "general" && (
            <GeneralPanel
              organizationId={organizationId}
              workspace={form.workspace}
              onChange={(patch) => setForm((prev) => ({ ...prev, workspace: { ...prev.workspace, ...patch } }))}
            />
          )}
          {tab === "notif" && <NotificationsPanel notifications={form.notifications} organizationId={organizationId} />}
          {tab === "maint" && <MaintenancePanel organizationId={organizationId} />}
          {tab === "integ" && (
            <IntegrationsPanel
              canManageSettings={canManageSettings}
              integrations={form.integrations}
              isDisconnecting={isDisconnecting}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}
          {tab === "rfid" && (
            <RfidPanel
              organizationId={organizationId}
              rfidHardware={form.rfid_hardware}
              onChange={(patch) => setForm((prev) => ({ ...prev, rfid_hardware: { ...prev.rfid_hardware, ...patch } }))}
            />
          )}
          {tab === "security" && <SecurityPanel security={form.security} />}
          {tab === "billing" && <BillingPanel organizationId={organizationId} />}
        </div>
      </div>
    </div>
  );
}
