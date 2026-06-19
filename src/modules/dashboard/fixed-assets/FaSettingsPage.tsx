"use client";

import {
  Bell, Check, Database, DollarSign, Radio, RefreshCw, Save, Settings as Cog, Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FaMeter, FaShellHead } from "@/modules/dashboard/fixed-assets";

const NAV = [
  { icon: Cog, id: "general", label: "General" },
  { icon: Bell, id: "notif", label: "Notifications" },
  { icon: RefreshCw, id: "maint", label: "Maintenance Reminders" },
  { icon: Database, id: "integ", label: "Integrations" },
  { icon: Radio, id: "rfid", label: "RFID Hardware" },
  { icon: Shield, id: "security", label: "Security" },
  { icon: DollarSign, id: "billing", label: "Billing" },
];

const INTEGRATIONS = [
  { connected: true, desc: "ERP / Accounting sync", name: "Accurate" },
  { connected: false, desc: "ERP / Accounting sync", name: "Odoo" },
  { connected: false, desc: "ERP / Accounting sync", name: "SAP" },
  { connected: true, desc: "Tax reporting (SPT 1771)", name: "DJP Online" },
  { connected: true, desc: "Payroll & contributions", name: "BPJS" },
  { connected: true, desc: "Tag printer", name: "Zebra ZD621" },
  { connected: true, desc: "Tag printer", name: "SATO CL4NX" },
  { connected: false, desc: "SSO / directory", name: "Active Directory" },
  { connected: true, desc: "Alerts channel", name: "Slack" },
];

const NOTIFY_TRIGGERS = [
  { email: true, event: "Asset check-out", recipient: "Custodian + Manager", slack: true, wa: false },
  { email: true, event: "Work order assigned", recipient: "Assignee", slack: true, wa: true },
  { email: true, event: "Maintenance overdue", recipient: "Manager + Custodian", slack: false, wa: true },
  { email: false, event: "Audit variance detected", recipient: "Auditor + Admin", slack: true, wa: false },
  { email: true, event: "Warranty expiring", recipient: "IT Support", slack: false, wa: false },
];

const READERS = [
  { id: "RDR-01", loc: "JKT-HQ · Gate 8N", model: "Zebra FX9600", rssi: -44, status: "online" },
  { id: "RDR-02", loc: "JKT-WS · Gate", model: "Impinj R420", rssi: -52, status: "online" },
  { id: "RDR-03", loc: "JKT-DC · Rack B", model: "Zebra FX9600", rssi: -40, status: "online" },
  { id: "RDR-04", loc: "Mfg-1 · Gate A", model: "Impinj R420", rssi: 0, status: "offline" },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600 }}>{label}</span>
      <input defaultValue={value} style={{ background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", padding: "8px 11px" }} />
    </label>
  );
}

function GeneralPanel() {
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Workspace</span></div>
      <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Company Name" value="PT. Indo Jaya Sejahtera" />
          <Field label="NPWP" value="01.234.567.8-091.000" />
          <Field label="Workspace ID" value="indojaya-fa-prod" />
          <Field label="Currency" value="IDR (Rp)" />
          <Field label="Language" value="Bahasa Indonesia" />
          <Field label="Timezone" value="WIB (UTC+7)" />
          <Field label="Fiscal Year Start" value="January" />
          <Field label="Depreciation Standard" value="PSAK 16" />
        </div>
        <div>
          <div style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Asset Numbering Scheme</div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[["Format", "CAT-SEQ-CODE"], ["Next Sequence", "009852"], ["Total Tagged", "9,851"]].map(([k, v]) => (
              <div key={k} style={{ background: "hsl(var(--surface-2))", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{k}</div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 16, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Channels</span></div>
        <div className="ks-card-body">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            {[["Email", true], ["WhatsApp", true], ["Slack", true], ["Microsoft Teams", false]].map(([n, on]) => (
              <div key={n as string} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{n}</span>
                {on ? <span className="ks-badge success">Connected</span> : <span className="ks-badge outline">Off</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Triggers</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">Event</th><th className="p-3 text-left font-medium text-muted-foreground">Recipient</th><th className="p-3 text-left font-medium text-muted-foreground">Email</th><th className="p-3 text-left font-medium text-muted-foreground">WhatsApp</th><th className="p-3 text-left font-medium text-muted-foreground">Slack</th></tr></thead>
          <tbody>
            {NOTIFY_TRIGGERS.map((t) => (
              <tr key={t.event}>
                <td className="border-t border-border p-3" style={{ fontWeight: 600 }}>{t.event}</td>
                <td className="border-t border-border p-3">{t.recipient}</td>
                <td className="border-t border-border p-3">{t.email ? <Check className="text-foreground" size={15} /> : <span className="text-muted-foreground">—</span>}</td>
                <td className="border-t border-border p-3">{t.wa ? <Check className="text-foreground" size={15} /> : <span className="text-muted-foreground">—</span>}</td>
                <td className="border-t border-border p-3">{t.slack ? <Check className="text-foreground" size={15} /> : <span className="text-muted-foreground">—</span>}</td>
              </tr>
            ))}
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

function IntegrationsPanel() {
  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)" }}>
      {INTEGRATIONS.map((i) => (
        <div key={i.name} className="ks-card">
          <div className="ks-card-body" style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
            <div style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 10, display: "flex", height: 44, justifyContent: "center", width: 44 }}><Database size={20} /></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{i.name}</div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{i.desc}</div>
            {i.connected ? <span className="ks-badge success">Connected</span> : <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Connecting ${i.name}…`)}>Connect</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function RfidPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Hardware Config</span></div>
        <div className="ks-card-body">
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Reader Polling Interval" value="2 seconds" />
            <Field label="RSSI Threshold" value="-70 dBm" />
            <Field label="EPC Encoding" value="SGTIN-96" />
            <Field label="Default Tag Type" value="Alien Higgs 9" />
          </div>
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Readers · {READERS.length}</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">ID</th><th className="p-3 text-left font-medium text-muted-foreground">Location</th><th className="p-3 text-left font-medium text-muted-foreground">Model</th><th className="p-3 text-left font-medium text-muted-foreground">RSSI</th><th className="p-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
          <tbody>
            {READERS.map((r) => (
              <tr key={r.id}>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{r.id}</td>
                <td className="border-t border-border p-3">{r.loc}</td>
                <td className="border-t border-border p-3">{r.model}</td>
                <td className="border-t border-border p-3">{r.rssi || "—"} dBm</td>
                <td className="border-t border-border p-3">{r.status === "online" ? <span className="ks-badge success">Online</span> : <span className="ks-badge danger">Offline</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Security</span></div>
      <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[["Session Timeout", "30 minutes of inactivity", "30 min"], ["IP Whitelist", "Restrict access to office ranges", "103.18.40.0/24"], ["MFA Requirement", "Required for Admin & Finance roles", "Enforced"], ["Audit Log Retention", "How long logs are kept", "2 years"], ["Password Policy", "Min 12 chars, mixed case, symbol", "Strict"]].map(([k, d, v], i) => (
          <div key={k} style={{ alignItems: "center", borderBottom: i < 4 ? "1px solid hsl(var(--border))" : "none", display: "flex", gap: 16, justifyContent: "space-between", padding: "14px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{k}</div>
              <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>{d}</div>
            </div>
            <span className="ks-badge outline">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Plan</span><span className="ks-badge brand">Enterprise</span></div>
        <div className="ks-card-body" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[["Plan", "Enterprise"], ["Renewal", "12 Jan 2026"], ["Seats", "142 / 200"]].map(([k, v]) => (
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
          {[["Assets", 9852, 10000, "brand"], ["RFID Reads / mo", 8.4, 10, "success"], ["Storage", 42, 100, "info"]].map(([label, cur, max, tone]) => (
            <div key={label as string}>
              <div style={{ alignItems: "center", display: "flex", fontSize: 13, justifyContent: "space-between", marginBottom: 5 }}>
                <span>{label}</span><span style={{ color: "hsl(var(--text-3))" }}>{cur} / {max}{label === "RFID Reads / mo" ? "M" : label === "Storage" ? " GB" : ""}</span>
              </div>
              <FaMeter pct={((cur as number) / (max as number)) * 100} tone={tone as string} />
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Invoice History</span></div>
        <table className="w-full text-sm">
          <thead><tr><th className="p-3 text-left font-medium text-muted-foreground">Invoice</th><th className="p-3 text-left font-medium text-muted-foreground">Date</th><th className="p-3 text-left font-medium text-muted-foreground">Amount</th><th className="p-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
          <tbody>
            {[["INV-2025-001", "01 Jan 2025", "Rp 42 jt", "Paid"], ["INV-2024-012", "01 Dec 2024", "Rp 42 jt", "Paid"], ["INV-2024-011", "01 Nov 2024", "Rp 38 jt", "Paid"]].map((r) => (
              <tr key={r[0]}>
                <td className="border-t border-border p-3" style={{ fontFamily: "ui-monospace, monospace" }}>{r[0]}</td>
                <td className="border-t border-border p-3">{r[1]}</td>
                <td className="border-t border-border p-3">{r[2]}</td>
                <td className="border-t border-border p-3"><span className="ks-badge success">{r[3]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FaSettingsPage() {
  const [tab, setTab] = useState("general");
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button" onClick={() => toast("Resetting demo data…")}><RefreshCw size={14} />Reset demo data</button>
            <button className="ks-btn ks-btn-primary" type="button" onClick={() => toast.success("Settings saved")}><Save size={14} />Save changes</button>
          </>
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
          {tab === "general" && <GeneralPanel />}
          {tab === "notif" && <NotificationsPanel />}
          {tab === "maint" && <MaintenancePanel />}
          {tab === "integ" && <IntegrationsPanel />}
          {tab === "rfid" && <RfidPanel />}
          {tab === "security" && <SecurityPanel />}
          {tab === "billing" && <BillingPanel />}
        </div>
      </div>
    </div>
  );
}
