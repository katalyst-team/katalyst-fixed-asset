import { Send, Sparkles } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import useChatSessionMessagesQuery from "@/hooks/api/ai-chat/useChatSessionMessagesQuery";
import useSendChatMessage from "@/hooks/api/ai-chat/useSendChatMessage";
import { cn } from "@/lib/utils";

export interface ChatDisplayMessage {
  content: string;
  id: string;
  role: "ASSISTANT" | "USER";
}

interface ChatPanelProps {
  className?: string;
  onSessionChange?: (sessionId: string | null) => void;
  sessionId: string | null;
}

export function ChatPanel({ className, onSessionChange, sessionId }: ChatPanelProps) {
  const { t } = useTranslation("ai-assistant");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionMessagesQuery = useChatSessionMessagesQuery({
    organizationId,
    sessionId: activeSessionId,
  });

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (sessionMessagesQuery.data?.data) {
      setMessages(
        sessionMessagesQuery.data.data
          .filter((message) => message.role === "USER" || message.role === "ASSISTANT")
          .map((message) => ({
            content: message.content,
            id: message.id,
            role: message.role as ChatDisplayMessage["role"],
          })),
      );
    }
  }, [sessionMessagesQuery.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ behavior: "smooth", top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sendMutation = useSendChatMessage({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          content: response.data.answer,
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
        },
      ]);
      if (response.data.session_id && response.data.session_id !== activeSessionId) {
        setActiveSessionId(response.data.session_id);
        onSessionChange?.(response.data.session_id);
      }
    },
    organizationId,
  });

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { content: trimmed, id: `user-${Date.now()}`, role: "USER" },
    ]);
    setInput("");

    sendMutation.mutate({
      message: trimmed,
      session_id: activeSessionId ?? undefined,
      store_id: selectedTeam && selectedTeam !== "0" ? selectedTeam : undefined,
    });
  }, [activeSessionId, input, selectedTeam, sendMutation]);

  const suggestions = [
    t("suggestionStockHealth"),
    t("suggestionTopMovers"),
    t("suggestionCriticalStock"),
    t("suggestionLowStock"),
    t("suggestionPendingAudits"),
    t("suggestionStorePerformance"),
  ];

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div ref={scrollRef} className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 px-1 py-4">
            {messages.length === 0 && !sendMutation.isPending ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="rounded-full bg-brand/10 p-4">
                  <Sparkles className="h-8 w-8 text-brand" />
                </div>
                <p className="text-sm font-medium text-foreground">{t("emptyTitle")}</p>
                <p className="text-xs text-muted-foreground max-w-sm">{t("emptyDescription")}</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                      type="button"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.role === "USER" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                      message.role === "USER"
                        ? "bg-brand text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {sendMutation.isPending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
            {sessionMessagesQuery.isLoading && activeSessionId ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-12 w-1/2" />
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border pt-3 mt-2">
        <div className="flex items-end gap-2">
          <Textarea
            className="resize-none min-h-[44px] max-h-32"
            placeholder={t("inputPlaceholder")}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            className="h-[44px] w-[44px] p-0 shrink-0"
            disabled={!input.trim() || sendMutation.isPending}
            size="icon"
            type="button"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{t("inputHint")}</p>
      </div>
    </div>
  );
}

export default ChatPanel;
