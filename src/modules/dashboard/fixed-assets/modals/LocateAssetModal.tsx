"use client";

import { MapPin, Package, Search, User } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import { useGetAssetRegisterQuery } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import type { FaAsset } from "@/types/fixed-assets";

interface LocateAssetModalProps {
  onClose: () => void;
  open: boolean;
}

export function LocateAssetModal({ onClose, open }: LocateAssetModalProps) {
  const { t } = useTranslation("fixed-assets");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const allAssets = useMemo(() => resp?.data ?? [], [resp]);
  const [query, setQuery] = useState<string>("");

  const results = useMemo<FaAsset[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allAssets.slice(0, 6);
    return allAssets.filter((a) =>
      [a.epc, a.id, a.loc, a.name].some((field) =>
        field.toLowerCase().includes(q),
      ),
    ).slice(0, 6);
  }, [query, allAssets]);

  function handleMap(id: string) {
    onClose();
    toast.info(t("modals.locate.showingOnMap", { id }));
  }

  function handleProfile(id: string) {
    onClose();
    router.push(`/dashboard/fixed-assets/register/${id}/`);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modals.locate.title")}</DialogTitle>
          <DialogDescription>{t("modals.locate.description")}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus={true}
            className="pl-9"
            placeholder={t("modals.locate.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              {t("modals.locate.noMatch", { query })}
            </div>
          ) : (
            results.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border",
                  "p-2.5",
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Package className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {a.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.loc}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    className="ks-btn ks-btn-ghost ks-btn-sm"
                    type="button"
                    onClick={() => handleMap(a.id)}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {t("modals.locate.mapButton")}
                  </button>
                  <button
                    className="ks-btn ks-btn-sm"
                    type="button"
                    onClick={() => handleProfile(a.id)}
                  >
                    <User className="h-3.5 w-3.5" />
                    {t("modals.locate.profileButton")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            type="button"
            onClick={onClose}
          >
            {t("modals.locate.close")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
