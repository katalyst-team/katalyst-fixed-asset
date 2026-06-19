"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import PaginationCursor from "@/components/shared/PaginationCursor";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetReferenceGroupsQuery from "@/hooks/api/reference/useGetReferenceGroupsQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { ReferenceGroupType } from "@/types/reference";

import ReferenceGroupItem from "./ReferenceGroupItem";
import ReferenceGroupModalAdd from "./ReferenceGroupModalAdd";

const ITEM_LIMIT = 20;

const ReferenceGroup = () => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const { canCreate } = usePermissions();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useGetReferenceGroupsQuery({
    cursor,
    limit: ITEM_LIMIT,
    organizationId,
  });

  const groups: ReferenceGroupType[] = data?.data?.groups ?? [];
  const isLoadingData = isLoading || isFetching;
  const nextCursor = data?.pagination?.next_cursor;
  const prevCursor = data?.pagination?.prev_cursor;

  return (
    <div
      className={`flex w-full flex-col gap-6 ${groups.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          {canCreate && (
            <ReferenceGroupModalAdd type="create" />
          )}
        </div>
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

      <div
        className={`w-full max-w-[91vw] lg:max-w-full flex-1 ${groups.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>{t("reference:table.header.no", "No")}</TableHead>
              <TableHead>{t("reference:table.header.name", "Name")}</TableHead>
              <TableHead>{t("reference:table.header.slug", "Slug")}</TableHead>
              <TableHead>
                {t("reference:table.header.description", "Description")}
              </TableHead>
              <TableHead>
                {t("reference:table.header.action", "Action")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoadingData &&
              groups.map((item, index) => (
                <ReferenceGroupItem
                  key={item.id}
                  item={item}
                  num={(currentPage - 1) * ITEM_LIMIT + index + 1}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          groups.length === 0 && (
            <EmptyState
              action={
                canCreate ? (
                  <ReferenceGroupModalAdd type="create" />
                ) : undefined
              }
              className="mt-4"
              description={t(
                "reference:empty.description",
                "Create your first reference group to organize lookup data."
              )}
              title={t("reference:empty.title", "No reference groups found")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ReferenceGroup;
