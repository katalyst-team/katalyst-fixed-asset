import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser } from "@/context/user-context";
import { useIsAiChatEnabled } from "@/hooks/api/feature-flag/useOrganizationFeatureFlags";

import ChatPanel from "./ChatPanel";

export function AiAssistantWidget() {
  const pathname = usePathname();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { aiChatEnabled } = useIsAiChatEnabled(organizationId);

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  if (!aiChatEnabled || pathname.startsWith("/dashboard/ai-assistant")) {
    return null;
  }

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        title="AI Assistant"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-brand" />
              AI Assistant
            </SheetTitle>
            <SheetDescription className="sr-only">
              Ask questions about your organization data
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 min-h-0 px-4 pb-4">
            <ChatPanel sessionId={sessionId} onSessionChange={setSessionId} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AiAssistantWidget;
