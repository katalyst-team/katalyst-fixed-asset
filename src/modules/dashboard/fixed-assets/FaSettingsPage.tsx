"use client";

import {
  Bell, Check, Database, DollarSign, Loader2, Radio, RefreshCw, Save, Settings as Cog, Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import {
  useConnectIntegrationMutation,
  useGetBillingQuery,
  useGetFASettingsQuery,
  useGetInvoicesQuery,
  useGetNotificationTriggersQuery,
  useGetRfidReadersQuery,
  useUpdateFASettingsMutation,
  useUpdateNotificationTriggersMutation,
} from "@/hooks/api/fixed-assets";
import { FaMeter, FaShellHead } from "@/modules/dashboard/fixed-assets";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaSettings } from "@/types/fixed-assets";

const DEFAULT_SETTINGS: FaSettings = {
  depreciation: { default_useful_life_years: {}, method: "straight-line" },
  integrations: { active_directory: { connected: false }, email_provider: { connected: false }, erp: { connected: false } },
  notifications: { audit_complete_notify: false, disposal_approval_notify: false, email_enabled: false, maintenance_reminder_days: [], push_enabled: false },
  rfid_hardware: { default_tag_type: "", epc_encoding: "", reader_polling_interval_ms: 0, rssi_threshold: 0 },
  security: { ip_whitelist: [], mfa_required: false, password_policy: "", session_timeout_min: 0 },
  workspace: { asset_id_prefix: "", company_name: "", currency: "", depreciation_standard: "", fiscal_year_start: "", next_asset_number: 0, npwp: "" },
};

const NAV = [
  { icon: Cog, id: "general", label: "General" },
  { icon: Bell, id: "notif", label: "Notifications" },
  { icon: RefreshCw, id: "maint", label: "Maintenance Reminders" },
  { icon: Database, id: "integ", label: "Integrations" },
  { icon: Radio, id: "rfid", label: "RFID Hardware" },
  { icon: Shield, id: "security", label: "Security" },
  { icon: DollarSign, id: "billing", label: "Billing" },
];

const STATIC_INTEGRATIONS = [
  { connected: true, desc: "Tax reporting (SPT 1771)", name: "DJP Online" },
  { connected: true, desc: "Payroll & contributions", name: "BPJS" },
  { connected: true, desc: "Tag printer", name: "Zebra ZD621" },
  { connected: true, desc: "Tag printer", name: "SATO CL4NX" },
  { connected: true, desc: "Alerts channel", name: "Slack" },
];

function Field({ label, onChange, value }: { label: string; onChange: (v: string) => void; value: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600 }}>{label}</span>
      <input style={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", padding: "8px 11px" }} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function GeneralPanel({ onChange, workspace }: {
  onChange: (patch: Partial<FaSettings["workspace"]>) => void;
  workspace: FaSettings["workspace"];
}) {
  const [extras, setExtras] = useState({ lang: "Bahasa Indonesia", totalTagged: "9,851", tz: "WIB (UTC+7)", wsId: "indojaya-fa-prod" });

  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Workspace</span></div>
      <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Company Name" value={workspace.company_name} onChange={(v) => onChange({ company_name: v })} />
          <Field label="NPWP" value={workspace.npwp} onChange={(v) => onChange({ npwp: v })} />
          <Field label="Workspace ID" value={extras.wsId} onChange={(v) => setExtras((p) => ({ ...p, wsId: v }))} />
          <Field label="Currency" value={workspace.currency} onChange={(v) => onChange({ currency: v })} />
          <Field label="Language" value={extras.lang} onChange={(v) => setExtras((p) => ({ ...p, lang: v }))} />
          <Field label="Timezone" value={extras.tz} onChange={(v) => setExtras((p) => ({ ...p, tz: v }))} />
          <Field label="Fiscal Year Start" value={workspace.fiscal_year_start} onChange={(v) => onChange({ fiscal_year_start: v })} />
          <Field label="Depreciation Standard" value={workspace.depreciation_standard} onChange={(v) => onChange({ depreciation_standard: v })} />
        </div>
        <div>
          <div style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Asset Numbering Scheme</div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { k: "Format", v: workspace.asset_id_prefix },
              { k: "Next Sequence", v: String(workspace.next_asset_number) },
              { k: "Total Tagged", v: extras.totalTagged },
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
  const { data: resp } = useGetNotificationTriggersQuery({ organizationId });
  const { isPending: isUpdating, mutateAsync: updateTriggersAsync } = useUpdateNotificationTriggersMutation({ organizationId });
  const triggers = resp?.data?.triggers ?? [];
  const channels = [
    { name: "Email", on: notifications.email_enabled },
    { name: "WhatsApp", on: true },
    { name: "Slack", on: true },
    { name: "Microsoft Teams", on: false },
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
        <div className="ks-card-head"><span className="ks-card-title">Channels</span></div>
        <div className="ks-card-body">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            {channels.map((c) => (
              <div key={c.name} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                {c.on ? <span className="ks-badge success">Connected</span> : <span className="ks-badge outline">Off</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Triggers</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">Event</th><th className="p-3 text-left font-medium text-muted-foreground">Email</th><th className="p-3 text-left font-medium text-muted-foreground">WhatsApp</th><th className="p-3 text-left font-medium text-muted-foreground">Slack</th></tr></thead>
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
  );
}

function MaintenancePanel() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.4fr 1fr" }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Reminder Rules</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">Rule</th><th className="p-3 text-left font-medium text-muted-foreground">Trigger</th><th className="p-3 text-left font-medium text-muted-foreground">Lead time</th></tr></thead>
          <tbody>
            {[["IT Equipment", "Every 90 days", "14d · 3d · 1d"], ["CNC + Machinery", "500 cycles / 1000h", "90% · 100%"], ["Vehicle Service", "5,000 km / 6 months", "500km · 100km"], ["Lab Calibration", "Annual · ISO 17025", "60d · 30d · 7d"], ["Fire Safety", "Monthly + annual", "7d · 1d"]].map((r) => (
              <tr key={r[0]}>
                <td className="border-t border-border p-3" style={{ fontWeight: 600 }}>{r[0]}</td>
                <td className="border-t border-border p-3">{r[1]}</td>
                <td className="border-t border-border p-3">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Upcoming</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Tomorrow", "PM IT Servers · 8 units"], ["3 days", "PH Meter calibration"], ["6 days", "Forklift 500h service"], ["12 days", "ISO 17025 calibration"]].map(([d, t]) => (
            <div key={t} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", gap: 10, padding: "9px 12px" }}>
              <span className="ks-badge warn">{d}</span>
              <span style={{ fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsPanel({ canManageSettings, integrations, isConnecting, onConnect }: {
  canManageSettings: boolean;
  integrations: FaSettings["integrations"];
  isConnecting: boolean;
  onConnect: (type: "active-directory" | "email" | "erp") => Promise<void>;
}) {
  const apiCards = [
    { connected: integrations.erp.connected, desc: "ERP / Accounting sync", name: integrations.erp.type ? integrations.erp.type.charAt(0).toUpperCase() + integrations.erp.type.slice(1) : "ERP", type: "erp" as const },
    { connected: integrations.active_directory.connected, desc: "SSO / directory", name: "Active Directory", type: "active-directory" as const },
    { connected: integrations.email_provider.connected, desc: "Notifications channel", name: "Email", type: "email" as const },
  ];

  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)" }}>
      {apiCards.map((i) => (
        <div key={i.name} className="ks-card">
          <div className="ks-card-body" style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
            <div style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 10, display: "flex", height: 44, justifyContent: "center", width: 44 }}><Database size={20} /></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{i.name}</div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{i.desc}</div>
            {i.connected ? <span className="ks-badge success">Connected</span> : canManageSettings ? (
              <button
                className="ks-btn ks-btn-sm"
                disabled={isConnecting}
                type="button"
                onClick={() => onConnect(i.type)}
              >
                {isConnecting ? <Loader2 className="animate-spin" size={14} /> : null}
                Connect
              </button>
            ) : <span className="ks-badge outline">Available</span>}
          </div>
        </div>
      ))}
      {STATIC_INTEGRATIONS.map((i) => (
        <div key={i.name} className="ks-card">
          <div className="ks-card-body" style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
            <div style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 10, display: "flex", height: 44, justifyContent: "center", width: 44 }}><Database size={20} /></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{i.name}</div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{i.desc}</div>
            {i.connected ? <span className="ks-badge success">Connected</span> : <span className="ks-badge outline">Available</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function RfidPanel({ onChange, organizationId, rfidHardware }: {
  onChange: (patch: Partial<FaSettings["rfid_hardware"]>) => void;
  organizationId: string;
  rfidHardware: FaSettings["rfid_hardware"];
}) {
  const { data: resp } = useGetRfidReadersQuery({ organizationId });
  const readers = resp?.data?.readers ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Hardware Config</span></div>
        <div className="ks-card-body">
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Reader Polling Interval" value={String(rfidHardware.reader_polling_interval_ms)} onChange={(v) => onChange({ reader_polling_interval_ms: Number(v) || 0 })} />
            <Field label="RSSI Threshold" value={String(rfidHardware.rssi_threshold)} onChange={(v) => onChange({ rssi_threshold: Number(v) || 0 })} />
            <Field label="EPC Encoding" value={rfidHardware.epc_encoding} onChange={(v) => onChange({ epc_encoding: v })} />
            <Field label="Default Tag Type" value={rfidHardware.default_tag_type} onChange={(v) => onChange({ default_tag_type: v })} />
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Readers · {readers.length}</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">ID</th><th className="p-3 text-left font-medium text-muted-foreground">Location</th><th className="p-3 text-left font-medium text-muted-foreground">Model</th><th className="p-3 text-left font-medium text-muted-foreground">IP</th><th className="p-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
          <tbody>
            {readers.map((r) => (
              <tr key={r.id}>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{r.id}</td>
                <td className="border-t border-border p-3">{r.location}</td>
                <td className="border-t border-border p-3">{r.model}</td>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{r.ip || "—"}</td>
                <td className="border-t border-border p-3">{r.status === "online" ? <span className="ks-badge success">Online</span> : r.status === "error" ? <span className="ks-badge danger">Error</span> : <span className="ks-badge danger">Offline</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityPanel({ security }: { security: FaSettings["security"] }) {
  const rows = [
    { desc: "Minutes of inactivity before auto-logout", title: "Session Timeout", val: `${security.session_timeout_min} min` },
    { desc: "Restrict access to specified ranges", title: "IP Whitelist", val: security.ip_whitelist.length > 0 ? security.ip_whitelist.join(", ") : "Any" },
    { desc: "Required for Admin & Finance roles", title: "MFA Requirement", val: security.mfa_required ? "Enforced" : "Off" },
    { desc: "How long logs are kept", title: "Audit Log Retention", val: "2 years" },
    { desc: "Min 12 chars, mixed case, symbol", title: "Password Policy", val: security.password_policy || "Default" },
  ];

  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Security</span></div>
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
        <div className="ks-card-head"><span className="ks-card-title">Plan</span><span className="ks-badge brand">{billing.plan}</span></div>
        <div className="ks-card-body" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[["Plan", billing.plan], ["Renewal", billing.renewal_date], ["Seats", `${billing.seats_used} / ${billing.seat_count}`]].map(([k, v]) => (
            <div key={k} style={{ background: "hsl(var(--surface-2))", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Usage</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { cur: billing.asset_count, label: "Assets", max: billing.asset_limit, tone: "brand", unit: "" },
            { cur: billing.storage_used_mb, label: "Storage", max: billing.storage_limit_mb, tone: "info", unit: " MB" },
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
        <div className="ks-card-head"><span className="ks-card-title">Invoice History</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">Invoice</th><th className="p-3 text-left font-medium text-muted-foreground">Date</th><th className="p-3 text-left font-medium text-muted-foreground">Amount</th><th className="p-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{inv.id}</td>
                <td className="border-t border-border p-3">{inv.date}</td>
                <td className="border-t border-border p-3">{inv.amount}</td>
                <td className="border-t border-border p-3"><span className={`ks-badge ${inv.status === "paid" ? "success" : inv.status === "pending" ? "warn" : "danger"}`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FaSettingsPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { canManageSettings } = useFaPermission();
  const [tab, setTab] = useState("general");
  const { data: resp, isLoading } = useGetFASettingsQuery({ organizationId });
  const { isPending: isSaving, mutateAsync: updateSettingsAsync } = useUpdateFASettingsMutation({ organizationId });
  const { isPending: isConnecting, mutateAsync: connectAsync } = useConnectIntegrationMutation({ organizationId });
  const settings = resp?.data;
  const [form, setForm] = useState<FaSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettingsAsync(form);
  };

  const handleConnect = async (type: "active-directory" | "email" | "erp") => {
    await connectAsync({ data: {}, type });
  };

  if (isLoading) return <Loading />;

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
              Save changes
            </button>
          ) : null
        }
        desc="Workspace, notifications, integrations, hardware, security, and billing."
        title="Settings"
      />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "220px 1fr" }}>
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
                  <Icon size={15} />{n.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          {tab === "general" && (
            <GeneralPanel
              workspace={form.workspace}
              onChange={(patch) => setForm((prev) => ({ ...prev, workspace: { ...prev.workspace, ...patch } }))}
            />
          )}
          {tab === "notif" && <NotificationsPanel notifications={form.notifications} organizationId={organizationId} />}
          {tab === "maint" && <MaintenancePanel />}
          {tab === "integ" && (
            <IntegrationsPanel
              canManageSettings={canManageSettings}
              integrations={form.integrations}
              isConnecting={isConnecting}
              onConnect={handleConnect}
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
