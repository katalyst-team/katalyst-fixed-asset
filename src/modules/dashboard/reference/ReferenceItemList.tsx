"use client";

import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetReferenceGroupByIdQuery from "@/hooks/api/reference/useGetReferenceGroupByIdQuery";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { ReferenceItemType } from "@/types/reference";

import ReferenceItemExportModal from "./ReferenceItemExportModal";
import ReferenceItemImportModal from "./ReferenceItemImportModal";
import ReferenceItemModalAdd from "./ReferenceItemModalAdd";
import ReferenceItemRow from "./ReferenceItemRow";
import ReferenceItemTemplateExportModal from "./ReferenceItemTemplateExportModal";

interface ReferenceItemListProps {
  groupId: string;
  hideBack?: boolean;
  hideSlugColumn?: boolean;
  hideSlugField?: boolean;
}

const ITEM_LIMIT = 20;

const ReferenceItemList = ({
  groupId,
  hideBack,
  hideSlugColumn = false,
  hideSlugField = false,
}: ReferenceItemListProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { hasMultipleStores, selectedTeam, tokenPayload } = useUser();
  const { canCreate } = usePermissions();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() =>
    !hasMultipleStores && selectedTeam && selectedTeam !== "0" ? selectedTeam : "all"
  );
  const [search, setSearch] = useState("");

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const storeId = selectedStoreId !== "all" ? selectedStoreId : undefined;

  const { data: groupData } = useGetReferenceGroupByIdQuery({
    groupId,
    organizationId,
  });
  const groupName = groupData?.data?.name ?? groupId;

  const { data, isLoading, isFetching } = useGetReferenceItemsQuery({
    cursor,
    groupId,
    limit: ITEM_LIMIT,
    organizationId,
    store_id: storeId,
  });

  const isLoadingData = isLoading || isFetching;
  const nextCursor = data?.pagination?.next_cursor;
  const prevCursor = data?.pagination?.prev_cursor;

  const items = useMemo(() => {
    const allItems: ReferenceItemType[] = data?.data?.items ?? [];
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.code ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleStoreChange = (value: string) => {
    setSelectedStoreId(value);
    setCursor(undefined);
    setCurrentPage(1);
  };

  return (
    <div
      className={`flex w-full flex-col gap-6 ${items.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex items-center gap-3">
        {!hideBack && (
          <Link href="/dashboard/reference">
            <Button size="icon" variant="ghost">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          <p className="text-sm text-muted-foreground">
            {t("reference:title", "Reference Groups")}
          </p>
          <h1 className="text-xl font-semibold font-heading">{groupName}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedStoreId} onValueChange={handleStoreChange}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-[200px] pl-8 text-sm"
              placeholder={t("common:search", "Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right: actions + pagination */}
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <ReferenceItemModalAdd
              groupId={groupId}
              hideSlugField={hideSlugField}
              store_id={storeId}
              type="create"
            />
          )}
          <ReferenceItemTemplateExportModal groupName={groupName} />
          {canCreate && <ReferenceItemImportModal groupId={groupId} />}
          <ReferenceItemExportModal groupId={groupId} groupName={groupName} />
          <PaginationCursor
            currentPage={currentPage}
            hasNextPage={Boolean(nextCursor)}
            hasPrevPage={currentPage > 1}
            limit={ITEM_LIMIT}
            onNext={() => {
              setCursor(nextCursor);
              setCurrentPage((p) => p + 1);
            }}
            onPrev={() => {
              setCursor(prevCursor || undefined);
              setCurrentPage((p) => p - 1);
            }}
          />
        </div>
      </div>

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${items.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>{t("reference:table.header.no", "No")}</TableHead>
              <TableHead>{t("reference:table.header.name", "Name")}</TableHead>
              {!hideSlugColumn && (
                <TableHead>{t("reference:table.header.slug", "Slug")}</TableHead>
              )}
              <TableHead>{t("reference:table.header.code", "Code")}</TableHead>
              <TableHead>
                {t("reference:table.header.sortOrder", "Sort Order")}
              </TableHead>
              <TableHead>{t("reference:table.header.store", "Store")}</TableHead>
              <TableHead>
                {t("reference:table.header.action", "Action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoadingData &&
              items.map((item, index) => (
                <ReferenceItemRow
                  key={item.id}
                  colSpan={hideSlugColumn ? 6 : 7}
                  groupId={groupId}
                  hideSlugColumn={hideSlugColumn}
                  hideSlugField={hideSlugField}
                  item={item}
                  num={(currentPage - 1) * ITEM_LIMIT + index + 1}
                  store_id={storeId}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          items.length === 0 && (
            <EmptyState
              action={
                canCreate ? (
                  <ReferenceItemModalAdd
                    groupId={groupId}
                    hideSlugField={hideSlugField}
                    store_id={storeId}
                    type="create"
                  />
                ) : undefined
              }
              className="mt-4"
              description={t(
                "reference:empty.itemsDescription",
                "Add your first item to this reference group."
              )}
              title={t("reference:empty.itemsTitle", "No items found")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ReferenceItemList;
