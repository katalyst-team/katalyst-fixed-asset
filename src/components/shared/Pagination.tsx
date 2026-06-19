// eslint-disable-next-line simple-import-sort/imports
import { FunctionComponent } from "react";

import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as Root,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FunctionComponent<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  return (
    <Root className="justify-end">
      <PaginationContent className="flex items-center gap-2">
        <PaginationItem>
          <PaginationPrevious
            className={`transition-all duration-200 hover:bg-accent/10 ${currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`}
            isDisable={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
        </PaginationItem>

        {/* Pagination items */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              className="transition-all duration-200 hover:bg-accent/10"
              isActive={currentPage === page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            className={`transition-all duration-200 hover:bg-accent/10 ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`}
            isDisable={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Root>
  );
};

export default Pagination;
