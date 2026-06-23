"use client";

import { History, Search, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import {
  useGetFAUserAuditLogQuery,
  useGetFAUsersQuery,
  useInviteFAUserMutation,
} from "@/hooks/api/fixed-assets";
import { avatarColor, FaKpiStrip, FaShellHead, FaStat, initials } from "@/modules/dashboard/fixed-assets";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

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

function UsersTab({ organizationId }: { organizationId: string }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const roles = ["All", "Admin", "Manager", "Auditor", "Operator", "Viewer"];
  const { data: resp } = useGetFAUsersQuery({ organizationId });
  const allUsers = resp?.data?.users ?? [];
  const rows = allUsers.filter((u) => (role === "All" || u.role === role) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase())));
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
          <tr><Th>User</Th><Th>Role</Th><Th>Department</Th><Th>Last active</Th><Th>Status</Th></tr>
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
              <Td>{u.lastActive}</Td>
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

function AuditTab({ organizationId }: { organizationId: string }) {
  const { data: resp } = useGetFAUserAuditLogQuery({ organizationId });
  const logs = resp?.data?.logs ?? [];
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Audit Log</span></div>
      <table className="w-full text-sm">
        <thead>
          <tr><Th>Time</Th><Th>User</Th><Th>Action</Th><Th>Resource</Th><Th>IP</Th></tr>
        </thead>
        <tbody>
          {logs.map((a) => (
            <tr key={a.id}>
              <Td style={{ fontFamily: "ui-monospace, monospace" }}>{a.timestamp}</Td>
              <Td>{a.user_name}</Td>
              <Td>{a.action}</Td>
              <Td>{a.entity_id}</Td>
              <Td style={{ color: "hsl(var(--text-3))", fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{a.ip}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaUsersPage() {
  const { tokenPayload } = useUser();
  const { canManageUsers } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: usersResp } = useGetFAUsersQuery({ organizationId });
  const userCount = usersResp?.data?.users?.length ?? 0;
  const [tab, setTab] = useState("users");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { mutateAsync: inviteUser } = useInviteFAUserMutation({ organizationId });
  const tabs = [
    { id: "users", label: "Users", meta: String(userCount) },
    { id: "roles", label: "Roles & Permissions", meta: "8" },
    { id: "audit", label: "Audit Log", meta: "" },
  ];
  const handleInvite = async () => {
    if (!inviteEmail) return;
    await inviteUser({ department: "", email: inviteEmail, role: "Viewer" });
    setInviteOpen(false);
    setInviteEmail("");
  };
  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManageUsers && <button className="ks-btn" type="button" onClick={() => setTab("audit")}><History size={14} />Audit log</button>}
            {canManageUsers && (
              <button className="ks-btn ks-btn-primary" type="button" onClick={() => setInviteOpen(true)}><UserPlus size={14} />Invite user</button>
            )}
          </>
        }
        desc="Manage users, roles, permissions, and audit activity."
        title="User Management"
      />
      <FaKpiStrip>
        <FaStat label="Total users" tone="brand" value={String(userCount)} />
        <FaStat label="MFA enabled" sub="of active users" tone="success" value="—" />
        <FaStat label="Pending invite" tone="warn" value={String(usersResp?.data?.users?.filter((u) => u.status === "invited").length ?? 0)} />
        <FaStat label="Failed logins" sub="last 24h" tone="danger" value="—" />
      </FaKpiStrip>
      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.id} className={t.id === tab ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
            {t.label}{t.meta ? ` · ${t.meta}` : ""}
          </button>
        ))}
      </div>
      {tab === "users" && <UsersTab organizationId={organizationId} />}
      {tab === "roles" && <RolesTab />}
      {tab === "audit" && <AuditTab organizationId={organizationId} />}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Enter email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
          />
          <DialogFooter>
            <Button onClick={handleInvite}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
