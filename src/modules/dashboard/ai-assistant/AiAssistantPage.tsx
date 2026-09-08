import { MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useChatSessionsQuery from "@/hooks/api/ai-chat/useChatSessionsQuery";
import useDeleteChatSession from "@/hooks/api/ai-chat/useDeleteChatSession";
import { useIsAiChatEnabled } from "@/hooks/api/feature-flag/useOrganizationFeatureFlags";
import { cn } from "@/lib/utils";

import ChatPanel from "./ChatPanel";

export function AiAssistantPage() {
  const { t } = useTranslation("ai-assistant");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { aiChatEnabled, isLoading: flagLoading } = useIsAiChatEnabled(organizationId);
  const sessionsQuery = useChatSessionsQuery({
    enabled: aiChatEnabled,
    organizationId,
  });
  const deleteSessionMutation = useDeleteChatSession({
    onSuccess: () => setActiveSessionId(null),
    organizationId,
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  if (flagLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!aiChatEnabled) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <EmptyState
          description={t("featureDisabledDescription")}
          icon={<Sparkles className="h-12 w-12 text-muted-foreground" />}
          title={t("featureDisabledTitle")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-9rem)]">
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("pageTitle")}</h1>
          <p className="ks-page-desc">{t("pageDescription")}</p>
        </div>
      </div>

      <div className="ks-card flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0">
          <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border">
            <div className="p-3 border-b border-border">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setActiveSessionId(null)}
              >
                <Plus className="h-4 w-4" />
                {t("newChat")}
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1 p-2">
                {sessionsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : sessionsQuery.data?.data && sessionsQuery.data.data.length > 0 ? (
                  sessionsQuery.data.data.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-muted transition-colors",
                        activeSessionId === session.id && "bg-muted",
                      )}
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1 text-foreground">{session.title}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteSessionMutation.mutate(session.id);
                          if (activeSessionId === session.id) {
                            setActiveSessionId(null);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="px-2 py-4 text-xs text-muted-foreground text-center">
                    {t("noSessions")}
                  </p>
                )}
              </div>
            </ScrollArea>
          </aside>

          <div className="flex-1 min-h-0 p-4">
            <ChatPanel
              sessionId={activeSessionId}
              onSessionChange={setActiveSessionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantPage;
