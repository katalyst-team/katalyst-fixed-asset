"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { BaseNavItem } from "@/lib/menu-utils";

interface NavMainProps {
  items: BaseNavItem[];
}

/**
 * Recursive component to render menu items with unlimited nesting
 */
function NavMenuItem({
  item,
  depth = 0,
}: {
  item: BaseNavItem;
  depth?: number;
}) {
  const { i18n } = useTranslation(["common"]);
  const isRoot = depth === 0;
  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is active (for parent open state)
  const hasActiveChild = React.useMemo(() => {
    function checkActive(children?: BaseNavItem[]): boolean {
      if (!children) return false;
      return children.some(
        (child) => child.isActive || checkActive(child.children),
      );
    }
    return checkActive(item.children);
  }, [item.children]);

  const [isOpen, setIsOpen] = React.useState(item.isActive || hasActiveChild);

  React.useEffect(() => {
    setIsOpen(item.isActive || hasActiveChild);
  }, [item.isActive, hasActiveChild]);

  if (hasChildren) {
    if (isRoot) {
      // Root level: Collapsible asChild → SidebarMenuItem (li)
      return (
        <Collapsible
          asChild
          className="group/collapsible"
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={item.isActive ? "bg-gray-200 font-bold" : ""}
                tooltip={item.title}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children!.map((childItem) => (
                  <SidebarMenuSubItem key={childItem.menuName}>
                    <NavMenuItem depth={depth + 1} item={childItem} />
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // Non-root: parent already rendered SidebarMenuSubItem (li), render Collapsible as div
    return (
      <Collapsible
        className="group/collapsible w-full"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
         <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              asChild
              className={item.isActive ? "bg-gray-200 font-bold" : ""}
            >
              <button className="w-full min-w-0" title={item.title} type="button">
                {item.icon && <item.icon className="shrink-0" />}
                <span className="whitespace-nowrap">{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </button>
            </SidebarMenuSubButton>
         </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((childItem) => (
              <SidebarMenuSubItem key={childItem.menuName}>
                <NavMenuItem depth={depth + 1} item={childItem} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Render as simple link (no children, this is a leaf node with actual navigation)
  // Root: SidebarMenuButton renders as <button>, so <Link><button> is fine (no <a><a>)
  if (isRoot) {
    return (
      <SidebarMenuButton
        asChild
        className={item.isActive ? "bg-gray-200 font-bold" : ""}
        tooltip={item.title}
      >
        <Link href={item.url} locale={i18n.language}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  // Non-root: SidebarMenuSubButton renders as <a> by default → use asChild to avoid <a><a>
  return (
    <SidebarMenuSubButton
      asChild
      className={item.isActive ? "bg-gray-200 font-bold" : ""}
      title={item.title}
    >
      <Link href={item.url} locale={i18n.language}>
        {item.icon && <item.icon className="shrink-0" />}
        <span className="whitespace-nowrap">{item.title}</span>
      </Link>
    </SidebarMenuSubButton>
  );
}

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.menuName} depth={0} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
