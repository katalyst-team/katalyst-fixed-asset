import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Globe, Pencil, Plus } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/user-context";
import useCreateStoreAreaDataMutation from "@/hooks/api/store/useCreateStoreAreaDataMutation";
import useCreateStoreDataMutation from "@/hooks/api/store/useCreateStoreDataMutation";
import useEditStoreDataMutation from "@/hooks/api/store/useEditStoreDataMutation";
import useGetStoreDataQuery, {
  KEY_USE_GET_STORE_DATA,
} from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    id: string;
  }[];
}) {
  const { t } = useTranslation("common");
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const { tokenPayload, setSelectedTeam, selectedTeam } = useUser();
  
  // Add "All" option to the beginning of teams array
  const allTeamsWithAll = React.useMemo(() => {
    const allOption = {
      id: "0",
      logo: Globe,
      name: "All",
      plan: "All Stores"
    };
    return [allOption, ...teams];
  }, [teams]);
  
  const [activeTeam, setActiveTeam] = React.useState(allTeamsWithAll[0]);
  
  // Store modal state
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  
  const { mutateAsync: createStore, isPending: isCreating } = useCreateStoreDataMutation();
  const { mutateAsync: createStoreArea, isPending: isCreatingArea } = useCreateStoreAreaDataMutation();
  const { mutateAsync: editStore, isPending: isEditingStore } = useEditStoreDataMutation();
  const isPending = isCreating || isCreatingArea;

  const { data: storeResp } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id || "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState<string | undefined>(undefined);

  const handleOpenEdit = (storeId: string) => {
    const store = storeResp?.data?.stores?.find((s) => s.id === storeId);
    const fallback = teams.find((t) => t.id === storeId);
    setEditingStoreId(storeId);
    setEditName(store?.name ?? fallback?.name ?? "");
    setEditAddress(store?.address ?? "");
    setEditStatus(store?.status ?? "ACTIVE");
    setIsEditModalOpen(true);
  };

  const handleEditStore = async () => {
    await editStore({
      address: editAddress,
      name: editName,
      organizationID: tokenPayload?.organization_id || "",
      status: editStatus || "ACTIVE",
      storeID: editingStoreId,
    })
      .then(async () => {
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_STORE_DATA(
            tokenPayload?.organization_id || ""
          ),
        });
        toast.success(t("storeModal.storeUpdated"));
        setIsEditModalOpen(false);
      })
      .catch((e) => toastError(e));
  };
  
  const handleCreateStore = async () => {
    await createStore({
      address: storeAddress,
      name: storeName,
      organization_id: tokenPayload?.organization_id || "",
      status: status || "ACTIVE",
    })
      .then(async (response) => {
        // Create a default "Main" area for the new store
        const storeId = response.data.id;
        try {
          await createStoreArea({
            areaName: "Main",
            organizationId: tokenPayload?.organization_id || "",
            storeId,
          });
        } catch (areaError) {
          console.error("Failed to create default area:", areaError);
          // Don't block the success flow if area creation fails
        }

        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_STORE_DATA(
            tokenPayload?.organization_id || ""
          ),
        });
        toast.success(t("storeModal.storeCreated"));
        setIsStoreModalOpen(false);
        // Reset form
        setStoreName("");
        setStoreAddress("");
        setStatus(undefined);
      })
      .catch((e) => toastError(e));
  };
  
  const isDisabled = !storeName || !status || isPending;
  
  // Sync activeTeam with selectedTeam from context
  useEffect(() => {
    if (allTeamsWithAll && allTeamsWithAll.length > 0 && selectedTeam) {
      const currentTeam = allTeamsWithAll.find(team => team.id === selectedTeam);
      if (currentTeam) {
        setActiveTeam(currentTeam);
      }
    }
  }, [selectedTeam, allTeamsWithAll]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeTeam?.logo && <activeTeam.logo className="size-4" />}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam?.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam?.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("stores")}
              </DropdownMenuLabel>
              {allTeamsWithAll.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  className="gap-2 p-2"
                  onClick={() => {
                    setActiveTeam(team);
                    setSelectedTeam(team.id); // This now automatically persists to localStorage
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {team?.logo && <team.logo className="size-4 shrink-0" />}
                  </div>
                  {team.name}
                  {team.id !== "0" && (
                    <button
                      aria-label={t("storeModal.editButton")}
                      className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(team.id);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 p-2" 
                onClick={() => setIsStoreModalOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t("addStore")}</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Store Creation Modal */}
      <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("storeModal.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("storeModal.createDescription")}
            </DialogDescription>
            <div className="flex py-4 flex-col w-full gap-4">
              <InputWithLabel
                isRequired
                label={t("storeModal.storeNameLabel")}
                placeholder={t("storeModal.storeNamePlaceholder")}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <InputWithLabel
                label={t("storeModal.addressLabel")}
                placeholder={t("storeModal.addressPlaceholder")}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
              <Label isRequired htmlFor="status">
                {t("storeModal.statusLabel")}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("storeModal.statusPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {t("storeModal.statusActive")}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t("storeModal.statusInactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                disabled={isDisabled}
                type="button"
                onClick={handleCreateStore}
              >
                {isPending
                  ? t("storeModal.creating")
                  : t("storeModal.createButton")}
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Store Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("storeModal.editTitle")}</DialogTitle>
            <DialogDescription>
              {t("storeModal.editDescription")}
            </DialogDescription>
            <div className="flex py-4 flex-col w-full gap-4">
              <InputWithLabel
                isRequired
                label={t("storeModal.storeNameLabel")}
                placeholder={t("storeModal.storeNamePlaceholder")}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <InputWithLabel
                label={t("storeModal.addressLabel")}
                placeholder={t("storeModal.addressPlaceholder")}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
              <Label isRequired htmlFor="edit-status">
                {t("storeModal.statusLabel")}
              </Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("storeModal.statusPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {t("storeModal.statusActive")}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t("storeModal.statusInactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                disabled={!editName || !editStatus || isEditingStore}
                type="button"
                onClick={handleEditStore}
              >
                {isEditingStore
                  ? t("storeModal.saving")
                  : t("storeModal.editButton")}
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
