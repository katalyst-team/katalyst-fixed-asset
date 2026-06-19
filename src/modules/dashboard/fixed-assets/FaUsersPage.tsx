"use client";

import { History, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { avatarColor, FaKpiStrip, FaShellHead, FaStat, initials } from "@/modules/dashboard/fixed-assets";
import { FA_USERS } from "@/services/fixed-assets/mock";

interface UserRow {
  department: string;
  email: string;
  lastLogin: string;
  mfa: boolean;
  name: string;
  role: string;
  status: "active" | "invited" | "suspended";
}

const USERS: UserRow[] = [
  { department: "Finance & Admin", email: "bambang.w@indojaya.id", lastLogin: "2m ago", mfa: true, name: "Bambang Wijaya", role: "Admin", status: "active" },
  { department: "IT", email: "dewi.a@indojaya.id", lastLogin: "14m ago", mfa: true, name: "Dewi Anggraini", role: "Manager", status: "active" },
  { department: "Operations", email: "rahmat.s@indojaya.id", lastLogin: "1h ago", mfa: true, name: "Rahmat Santoso", role: "Auditor", status: "active" },
  { department: "Operations", email: "andi.p@indojaya.id", lastLogin: "3h ago", mfa: false, name: "Andi Pratama", role: "Operator", status: "active" },
  { department: "Manufacturing", email: "eko.p@indojaya.id", lastLogin: "yesterday", mfa: true, name: "Eko Pranata", role: "Operator", status: "active" },
  { department: "IT", email: "citra.w@indojaya.id", lastLogin: "—", mfa: false, name: "Citra Wijaya", role: "Viewer", status: "invited" },
  { department: "Maintenance", email: "galang.t@indojaya.id", lastLogin: "2 weeks", mfa: false, name: "Galang Tirta", role: "Operator", status: "suspended" },
  { department: "Lab", email: "ratna.i@indojaya.id", lastLogin: "5h ago", mfa: true, name: "Ratna Indira", role: "Manager", status: "active" },
];

const ROLES = [
  { count: 4, desc: "Full access to all modules, settings, and user management.", name: "Admin", perms: ["All Modules", "Settings", "Billing", "Users"] },
  { count: 18, desc: "Manage assets, transfers, disposals, and maintenance schedules.", name: "Asset Manager", perms: ["Assets", "Transfers", "Disposals", "Reports"] },
  { count: 42, desc: "Day-to-day custody of assigned assets and check-outs.", name: "Custodian", perms: ["My Assets", "Check-out", "Return"] },
  { count: 8, desc: "Read-only access to registers, reports, and audit trails.", name: "Auditor", perms: ["Reports", "Audit Log", "Read-only"] },
  { count: 22, desc: "Create and close work orders, manage PM schedules.", name: "Maintenance", perms: ["Work Orders", "PM Rules", "Health"] },
  { count: 12, desc: "Depreciation, disposals, GL integration, and compliance.", name: "Finance", perms: ["Finance", "PSAK 16", "Disposals"] },
  { count: 14, desc: "RFID hardware config, reader health, and tag management.", name: "IT Support", perms: ["RFID Hardware", "Settings", "Users"] },
  { count: 22, desc: "View dashboards and reports only — no edits.", name: "Read-Only", perms: ["Dashboard", "Reports"] },
];

const AUDIT_LOG = [
  { action: "Logged in", ip: "103.18.40.12", resource: "—", time: "14:22", user: "Bambang W." },
  { action: "Generated report", ip: "103.18.40.12", resource: "Depreciation Schedule", time: "14:08", user: "Bambang W." },
  { action: "Updated asset", ip: "103.18.40.88", resource: "IT-LP-9847", time: "13:42", user: "Dewi A." },
  { action: "Created transfer", ip: "103.18.40.91", resource: "MUT-2410-0142", time: "13:18", user: "Dewi A." },
  { action: "Failed login", ip: "45.127.44.2", resource: "—", time: "12:54", user: "unknown" },
  { action: "Closed work order", ip: "103.18.40.77", resource: "WO-2410-088", time: "12:20", user: "Eko P." },
  { action: "Exported EPCIS", ip: "103.18.40.12", resource: "EPCIS JSON-LD", time: "11:48", user: "Bambang W." },
];

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3 text-left font-medium text-muted-foreground">{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="border-t border-border p-3" style={style}>{children}</td>;
}

function statusBadge(s: string) {
  if (s === "active") return <span className="ks-badge success">Active</span>;
  if (s === "invited") return <span className="ks-badge warn">Invited</span>;
  return <span className="ks-badge danger">Suspended</span>;
}

function UsersTab() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const roles = ["All", "Admin", "Manager", "Auditor", "Operator", "Viewer"];
  const rows = USERS.filter((u) => (role === "All" || u.role === role) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase())));
  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <div className="ks-search-box" style={{ width: 240 }}>
          <Search size={14} />
          <input placeholder="Search users…" style={{ background: "transparent", border: 0, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" }} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="ks-chips">
          {roles.map((r) => (
            <button key={r} className={"ks-chip" + (r === role ? " on" : "")} type="button" onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr><Th>User</Th><Th>Role</Th><Th>Department</Th><Th>MFA</Th><Th>Last login</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {rows.map((u, idx) => (
            <tr key={u.email}>
              <Td>
                <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                  <span style={{ alignItems: "center", background: avatarColor(idx), borderRadius: "50%", color: "#fff", display: "flex", fontSize: 11, fontWeight: 700, height: 30, justifyContent: "center", width: 30 }}>{initials(u.name)}</span>
                  <span>{u.name}<br /><span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{u.email}</span></span>
                </div>
              </Td>
              <Td><span className="ks-badge info">{u.role}</span></Td>
              <Td>{u.department}</Td>
              <Td>{u.mfa ? <span className="ks-badge success">On</span> : <span className="ks-badge outline">Off</span>}</Td>
              <Td>{u.lastLogin}</Td>
              <Td>{statusBadge(u.status)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RolesTab() {
  return (
    <div className="ks-grid-2">
      {ROLES.map((r) => (
        <div key={r.name} className="ks-card">
          <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
              <span className="ks-badge brand">{r.count} users</span>
            </div>
            <p style={{ color: "hsl(var(--text-2))", fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{r.desc}</p>
            <div className="ks-chips">
              {r.perms.map((p) => (
                <span key={p} className="ks-badge outline">{p}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditTab() {
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Audit Log</span></div>
      <table className="w-full text-sm">
        <thead>
          <tr><Th>Time</Th><Th>User</Th><Th>Action</Th><Th>Resource</Th><Th>IP</Th></tr>
        </thead>
        <tbody>
          {AUDIT_LOG.map((a, i) => (
            <tr key={i}>
              <Td style={{ fontFamily: "ui-monospace, monospace" }}>{a.time}</Td>
              <Td>{a.user}</Td>
              <Td>{a.action}</Td>
              <Td>{a.resource}</Td>
              <Td style={{ color: "hsl(var(--text-3))", fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{a.ip}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaUsersPage() {
  const [tab, setTab] = useState("users");
  const tabs = [
    { id: "users", label: "Users", meta: String(FA_USERS.length) },
    { id: "roles", label: "Roles & Permissions", meta: "8" },
    { id: "audit", label: "Audit Log", meta: "" },
  ];
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button" onClick={() => toast("Opening audit log…")}><History size={14} />Audit log</button>
            <button className="ks-btn ks-btn-primary" type="button" onClick={() => toast("Sending invite…")}><UserPlus size={14} />Invite user</button>
          </>
        }
        desc="Manage users, roles, permissions, and audit activity."
        title="User Management"
      />
      <FaKpiStrip>
        <FaStat label="Total users" tone="brand" value="142" />
        <FaStat label="MFA enabled" sub="of active users" tone="success" value="88%" />
        <FaStat label="Pending invite" tone="warn" value="8" />
        <FaStat label="Failed logins" sub="last 24h" tone="danger" value="3" />
      </FaKpiStrip>
      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.id} className={t.id === tab ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
            {t.label}{t.meta ? ` · ${t.meta}` : ""}
          </button>
        ))}
      </div>
      {tab === "users" && <UsersTab />}
      {tab === "roles" && <RolesTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}
