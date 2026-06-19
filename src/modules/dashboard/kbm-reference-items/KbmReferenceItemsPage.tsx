"use client";

import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
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
import useGetReferenceGroupBySlugQuery from "@/hooks/api/reference/useGetReferenceGroupBySlugQuery";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { ReferenceItemType } from "@/types/reference";

import ReferenceItemExportModal from "../reference/ReferenceItemExportModal";
import ReferenceItemImportModal from "../reference/ReferenceItemImportModal";
import ReferenceItemModalAdd from "../reference/ReferenceItemModalAdd";
import ReferenceItemRow from "../reference/ReferenceItemRow";
import ReferenceItemTemplateExportModal from "../reference/ReferenceItemTemplateExportModal";

const ITEM_LIMIT = 20;

interface KbmReferenceItemsPageProps {
  /**
   * Optional slug of the group whose items appear in the "related_to" filter dropdown.
   * When provided, a dropdown is shown to filter items by relation.
   */
  filterByGroupSlug?: string;
  filterLabel?: string;
  /** i18n namespace that contains title / description / table / empty keys */
  namespace: string;
  /** Reference group slug used to resolve groupId */
  slug: string;
}

const KbmReferenceItemsPage = ({
  filterByGroupSlug,
  filterLabel,
  namespace,
  slug,
}: KbmReferenceItemsPageProps) => {
  const { t } = useTranslation([namespace, "common"]);
  const { hasMultipleStores, tokenPayload } = useUser();
  const { canCreate } = usePermissions();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [selectedFilterId, setSelectedFilterId] = useState<string>("all");

  const storeId = selectedStoreId !== "all" ? selectedStoreId : undefined;
  const filterId = selectedFilterId !== "all" ? selectedFilterId : undefined;

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && selectedStoreId === "all") {
      setSelectedStoreId(stores[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  // Resolve main group by slug
  const { data: groupData, isLoading: isLoadingGroup } =
    useGetReferenceGroupBySlugQuery({ organizationId, slug });
  const groupId = groupData?.data?.id ?? "";

  // Resolve optional filter group by slug
  const { data: filterGroupData } = useGetReferenceGroupBySlugQuery({
    enabled: Boolean(organizationId && filterByGroupSlug),
    organizationId,
    slug: filterByGroupSlug ?? "",
  });
  const filterGroupId = filterGroupData?.data?.id ?? "";

  const { data: filterItemsData } = useGetReferenceItemsQuery({
    enabled: Boolean(filterGroupId),
    groupId: filterGroupId,
    limit: 1000,
    organizationId,
    store_id: storeId,
  });
  const filterItems = filterItemsData?.data?.items ?? [];

  const { data, isLoading, isFetching } = useGetReferenceItemsQuery({
    cursor,
    enabled: Boolean(groupId),
    groupId,
    limit: ITEM_LIMIT,
    organizationId,
    related_to: filterId,
    store_id: storeId,
  });

  const items: ReferenceItemType[] = data?.data?.items ?? [];
  const isLoadingData = isLoadingGroup || isLoading || isFetching;

  const handleStoreChange = (value: string) => {
    setSelectedStoreId(value);
    setSelectedFilterId("all");
    setCursor(undefined);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
    setCursor(undefined);
    setCurrentPage(1);
  };

  return (
    <div
      className={`flex w-full min-w-0 flex-col gap-4 ${items.length === 0 && !isLoadingData ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-2">
        <h1 className="text-xl font-semibold font-heading">
          {t(`${namespace}:title`)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(`${namespace}:description`)}
        </p>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && groupId && (
            <ReferenceItemModalAdd
              groupId={groupId}
              store_id={storeId}
              type="create"
            />
          )}
          <ReferenceItemTemplateExportModal groupName={slug} />
          {canCreate && groupId && <ReferenceItemImportModal groupId={groupId} />}
          {groupId && <ReferenceItemExportModal groupId={groupId} groupName={slug} />}
          <Select value={selectedStoreId} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("common:allStores", "All Stores")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("common:allStores", "All Stores")}
              </SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterItems.length > 0 && (
            <Select value={selectedFilterId} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue
                  placeholder={filterLabel ?? t("common:all", "All")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {filterLabel ?? t("common:all", "All")}
                </SelectItem>
                {filterItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <PaginationCursor
          currentPage={currentPage}
          hasNextPage={false}
          hasPrevPage={currentPage > 1}
          limit={ITEM_LIMIT}
          onNext={() => {
            setCurrentPage((p) => p + 1);
            setCursor(undefined);
          }}
          onPrev={() => {
            setCurrentPage((p) => p - 1);
            setCursor(undefined);
          }}
        />
      </div>

      <div
        className={`w-full min-w-0 max-w-[91vw] flex-1 lg:max-w-full ${items.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="rounded-md border shadow-md">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">
                {t(`${namespace}:table.header.no`, "No")}
              </TableHead>
              <TableHead className="min-w-[200px]">
                {t(`${namespace}:table.header.name`, "Name")}
              </TableHead>
              <TableHead className="min-w-[100px]">
                {t(`${namespace}:table.header.code`, "Code")}
              </TableHead>
              <TableHead className="min-w-[100px]">
                {t(`${namespace}:table.header.sortOrder`, "Sort Order")}
              </TableHead>
              <TableHead className="min-w-[150px]">
                {t(`${namespace}:table.header.action`, "Action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoadingData &&
              groupId &&
              items.map((item, index) => (
                <ReferenceItemRow
                  key={item.id}
                  colSpan={5}
                  groupId={groupId}
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
                canCreate && groupId ? (
                  <ReferenceItemModalAdd
                    groupId={groupId}
                    store_id={storeId}
                    type="create"
                  />
                ) : undefined
              }
              className="mt-4"
              description={t(`${namespace}:empty.description`)}
              title={t(`${namespace}:empty.title`)}
            />
          )
        )}
      </div>
    </div>
  );
};

export default KbmReferenceItemsPage;
