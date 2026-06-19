import { useTranslation } from "next-i18next";
import { FunctionComponent } from "react";

import {
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationCursorProps {
  // currentPage: number; // Removed
  // onPageChange: (page: number) => void; // Removed
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void; // Added
  onPrev: () => void; // Added
  currentPage?: number;
  totalCount?: number | null;
  limit?: number;
  totalPages?: number;
}

const PaginationCursor: FunctionComponent<PaginationCursorProps> = ({
  // currentPage, // Removed
  // onPageChange, // Removed
  hasNextPage,
  hasPrevPage,
  onNext, // Added
  onPrev, // Added
  currentPage,
  totalCount,
  limit,
  totalPages,
}) => {
  const { i18n, t } = useTranslation("common");
  // handlePageChange function removed
  const hasCurrentPage = typeof currentPage === "number" && currentPage > 0;
  const resolvedTotalCount =
    typeof totalCount === "number" ? totalCount : undefined;
  const resolvedLimit =
    typeof limit === "number" && limit > 0 ? limit : undefined;
  const resolvedTotalPages =
    typeof totalPages === "number" && totalPages > 0
      ? totalPages
      : resolvedTotalCount !== undefined && resolvedLimit !== undefined
        ? Math.max(1, Math.ceil(resolvedTotalCount / resolvedLimit))
        : undefined;
  const numberFormatter = new Intl.NumberFormat(i18n.language ?? "en");
  const formattedCurrentPage = hasCurrentPage
    ? numberFormatter.format(currentPage)
    : undefined;
  const formattedTotalPages =
    resolvedTotalPages !== undefined
      ? numberFormatter.format(resolvedTotalPages)
      : undefined;
  const labelText = hasCurrentPage
    ? resolvedTotalPages
      ? t("pagination.pageOf", {
          current: formattedCurrentPage,
          total: formattedTotalPages,
        })
      : t("pagination.page", { current: formattedCurrentPage })
    : undefined;
  const itemCountText =
    hasCurrentPage && resolvedTotalCount !== undefined
      ? resolvedTotalCount === 1
        ? t("pagination.item", {
            value: numberFormatter.format(resolvedTotalCount),
          })
        : t("pagination.items", {
            value: numberFormatter.format(resolvedTotalCount),
          })
      : undefined;

  return (
    <PaginationContent className="flex items-center gap-2">
      <PaginationItem>
        <PaginationPrevious
          className={`transition-all duration-200 hover:bg-accent/10 ${!hasPrevPage ? "cursor-not-allowed opacity-50" : ""}`}
          href="#"
          isDisable={!hasPrevPage}
          size={"sm"}
          onClick={onPrev} // Use onPrev directly
        />
      </PaginationItem>

      {labelText ? (
        <PaginationItem>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {labelText}
          </span>
          {itemCountText ? (
            <span className="ml-2 text-xs text-muted-foreground">
              {itemCountText}
            </span>
          ) : null}
        </PaginationItem>
      ) : null}

      <PaginationItem>
        <PaginationNext
          className={`transition-all duration-200 hover:bg-accent/10 ${!hasNextPage ? "cursor-not-allowed opacity-50" : ""}`}
          href="#"
          isDisable={!hasNextPage}
          size={"sm"}
          onClick={onNext} // Use onNext directly
        />
      </PaginationItem>
    </PaginationContent>
  );
};

export default PaginationCursor;
