"use client";

import { History, Search, UserPlus } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useGetFAUserAuditLogQuery,
  useGetFAUsersQuery,
  useGetRolesQuery,
  useInviteFAUserMutation,
} from "@/hooks/api/fixed-assets";
import { avatarColor, FaKpiStrip, FaShellHead, FaStat, initials } from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3 text-left font-medium text-muted-foreground">{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="border-t border-border p-3" style={style}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("fixed-assets");
  if (status === "active") return <span className="ks-badge success">{t("page.users.status.active")}</span>;
  if (status === "inactive") return <span className="ks-badge warn">{t("page.users.status.invited")}</span>;
  return <span className="ks-badge danger">{t("page.users.status.suspended")}</span>;
}

function UsersTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const { data: resp } = useGetFAUsersQuery({ organizationId });
  const allUsers = resp?.data?.users ?? [];
  const roles = ["All", ...Array.from(new Set(allUsers.map((u) => u.role).filter(Boolean)))];
  const rows = allUsers.filter((u) => (role === "All" || u.role === role) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase())));
  return (
    <div className="ks-card">
      <div className="ks-card-head" style={{ flexWrap: "wrap" }}>
        <div className="ks-search-box" style={{ maxWidth: 240, width: "100%" }}>
          <Search size={14} />
          <input placeholder={t("page.users.searchPlaceholder")} style={{ background: "transparent", border: 0, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" }} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="ks-chips">
          {roles.map((r) => (
            <button key={r} className={"ks-chip" + (r === role ? " on" : "")} type="button" onClick={() => setRole(r)}>{r === "All" ? t("page.users.allRoles") : r}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
      <table className="w-full text-sm">
        <thead>
          <tr><Th>{t("page.users.columns.user")}</Th><Th>{t("page.users.columns.role")}</Th><Th>{t("page.users.columns.department")}</Th><Th>{t("page.users.columns.lastActive")}</Th><Th>{t("page.users.columns.status")}</Th></tr>
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
              <Td>{u.last_active}</Td>
              <Td><StatusBadge status={u.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function RolesTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp, isError, isLoading } = useGetRolesQuery({ organizationId });
  const roles = resp?.data?.roles ?? [];
  return (
    <FaQueryState
      emptyDescription={t("page.users.noRolesDesc")}
      emptyTitle={t("page.users.noRoles")}
      isEmpty={roles.length === 0}
      isError={isError}
      isLoading={isLoading}
    >
      <div className="ks-grid-2">
        {roles.map((r) => (
          <div key={r.id} className="ks-card">
            <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                <span className="ks-badge brand">{t("page.users.usersCount", { count: r.user_count })}</span>
              </div>
              <p style={{ color: "hsl(var(--text-2))", fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{r.description}</p>
              <div className="ks-chips">
                {r.permissions.map((p) => (
                  <span key={p} className="ks-badge outline">{p}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </FaQueryState>
  );
}

function AuditTab({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation("fixed-assets");
  const { data: resp } = useGetFAUserAuditLogQuery({ organizationId });
  const logs = resp?.data?.logs ?? [];
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">{t("page.users.auditLog")}</span></div>
      <div style={{ overflowX: "auto" }}>
      <table className="w-full text-sm">
        <thead>
          <tr><Th>{t("page.users.columns.time")}</Th><Th>{t("page.users.columns.user")}</Th><Th>{t("page.users.columns.action")}</Th><Th>{t("page.users.columns.resource")}</Th><Th>{t("page.users.columns.ip")}</Th></tr>
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
    </div>
  );
}

export function FaUsersPage() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const { canManageUsers } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: usersResp } = useGetFAUsersQuery({ organizationId });
  const { data: rolesResp } = useGetRolesQuery({ organizationId });
  const summary = usersResp?.data?.summary;
  const userCount = summary?.total_users ?? usersResp?.data?.users?.length ?? 0;
  const [tab, setTab] = useState("users");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const inviteRoles = rolesResp?.data?.roles ?? [];
  const { mutateAsync: inviteUser } = useInviteFAUserMutation({ organizationId });
  const tabs = [
    { id: "users", label: t("page.users.tabUsers"), meta: String(userCount) },
    { id: "roles", label: t("page.users.tabRoles"), meta: String(inviteRoles.length) },
    { id: "audit", label: t("page.users.auditLog"), meta: "" },
  ];
  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return;
    await inviteUser({ department: "", email: inviteEmail, role: inviteRole });
    setInviteOpen(false);
    setInviteEmail("");
  };
  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManageUsers && <button className="ks-btn" type="button" onClick={() => setTab("audit")}><History size={14} />{t("page.users.auditLog")}</button>}
            {canManageUsers && (
              <button className="ks-btn ks-btn-primary" type="button" onClick={() => setInviteOpen(true)}><UserPlus size={14} />{t("page.users.invite")}</button>
            )}
          </>
        }
        desc={t("page.users.description")}
        title={t("page.users.title")}
      />
      <FaKpiStrip>
        <FaStat label={t("page.users.kpi.totalUsers")} tone="brand" value={String(userCount)} />
        <FaStat label={t("page.users.kpi.activeRate")} sub={t("page.users.kpi.activeRateSub")} tone="success" value={summary ? `${Math.round(summary.active_rate)}%` : "—"} />
        <FaStat label={t("page.users.kpi.pendingInvite")} tone="warn" value={String(summary?.pending_invites ?? "—")} />
        <FaStat label={t("page.users.kpi.failedLogins")} sub={t("page.users.kpi.failedLoginsSub")} tone="danger" value="—" />
      </FaKpiStrip>
      <div className="ks-seg" style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.id} className={t.id === tab ? "on" : ""} type="button" onClick={() => setTab(t.id)}>
            {t.label}{t.meta ? ` · ${t.meta}` : ""}
          </button>
        ))}
      </div>
      {tab === "users" && <UsersTab organizationId={organizationId} />}
      {tab === "roles" && <RolesTab organizationId={organizationId} />}
      {tab === "audit" && <AuditTab organizationId={organizationId} />}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.users.invite")}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder={t("page.users.emailPlaceholder")}
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
          />
          <Select
            value={inviteRole}
            onValueChange={setInviteRole}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("page.users.selectRole")} />
            </SelectTrigger>
            <SelectContent>
              {inviteRoles.map((r) => (
                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button disabled={!inviteEmail || !inviteRole} onClick={handleInvite}>{t("page.users.sendInvite")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
