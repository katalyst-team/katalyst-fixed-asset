"use client";

import { getCookie, setCookie } from "cookies-next";
import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/api/auth/useLogout";

export function NavUser({
  user,
}: {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const logout = useLogout();
  const { t, i18n } = useTranslation(["common"]);
  const router = useRouter();

  // Persist language preference
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = getCookie("NEXT_LOCALE");
      if (
        i18n &&
        typeof i18n.changeLanguage === "function" &&
        savedLang &&
        typeof savedLang === "string" &&
        savedLang !== i18n.language
      ) {
        i18n.changeLanguage(savedLang);
      }
    }
  }, [i18n, i18n.language]);

  const handleLanguageChange = async (lng: string) => {
    if (typeof window !== "undefined") {
      try {
        // Handle setCookie which might return a Promise
        const cookieResult = setCookie("NEXT_LOCALE", lng);
        if (cookieResult instanceof Promise) {
          await cookieResult;
        }
      } catch (error) {
        console.error("Error setting language cookie:", error);
      }
    }
    await i18n.changeLanguage(lng);
    // Update the URL to reflect the new locale
    router.push(router.asPath, router.asPath, { locale: lng });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={user.name} src={user.avatar} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user.name} src={user.avatar} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <BadgeCheck />
                {t("account")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>{t("common:language")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    disabled={i18n.language === "id"}
                    onClick={() => handleLanguageChange("id")}
                  >
                    {t("common:bahasaIndonesia")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={i18n.language === "en"}
                    onClick={() => handleLanguageChange("en")}
                  >
                    {t("common:english")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
