import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useGetRecentTransactionsQuery from "@/hooks/api/dashboard/useRecentTransactionsQuery";

export function RecentTransactions() {
  const { t } = useTranslation("overview");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const storeId = selectedTeam === "0" ? undefined : selectedTeam;

  const { data: transactionsData, isLoading } = useGetRecentTransactionsQuery({
    limit: 5,
    organizationId,
    storeId,
  });

  const transactions = transactionsData?.data?.transactions ?? [];

  const getTypeStyles = (type: string) => {
    if (type === "Inbound") {
      return {
        bg: "hsl(var(--success-soft))",
        color: "hsl(var(--success))",
        icon: ArrowDownRight,
      };
    }
    return {
      bg: "hsl(var(--warn-soft))",
      color: "hsl(var(--warn))",
      icon: ArrowUpRight,
    };
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          {t("recentTransactions.title", "Recent Transactions")}
        </div>
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-3)" }}>
                <Skeleton className="h-10 w-10 rounded-md" />
                <div style={{ flex: 1, gap: "var(--space-1)" }}>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div style={{ textAlign: "right" }}>
                  <Skeleton className="h-4 w-16 mb-1 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              color: "hsl(var(--text-3))",
              fontSize: "13px",
              padding: "30px 0",
              textAlign: "center",
            }}
          >
            {t("recentTransactions.empty", "No recent transactions")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {transactions.map((txn) => {
              const styles = getTypeStyles(txn.type);
              const Icon = styles.icon;

              return (
                <div
                  key={txn.id}
                  style={{
                    alignItems: "center",
                    background: "hsl(var(--surface-2))",
                    border: "1px solid hsl(var(--border-subtle))",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    transition: "background 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsl(var(--surface-3))";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "hsl(var(--surface-2))";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ alignItems: "center", display: "flex", gap: "var(--space-3)" }}>
                    <div
                      style={{
                        alignItems: "center",
                        background: styles.bg,
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        height: 40,
                        justifyContent: "center",
                        opacity: 0.8,
                        width: 40,
                      }}
                    >
                      <Icon size={20} style={{ color: styles.color }} />
                    </div>
                    <div>
                      <div
                        style={{
                          color: "hsl(var(--text))",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {txn.item_name}
                      </div>
                      <div
                        style={{
                          alignItems: "center",
                          color: "hsl(var(--text-3))",
                          display: "flex",
                          fontSize: "0.75rem",
                          gap: 4,
                        }}
                      >
                        <Clock size={10} />
                        {formatTime(txn.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: "hsl(var(--text))",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {txn.quantity} units
                    </div>
                    <div
                      style={{
                        color: styles.color,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {txn.type}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
