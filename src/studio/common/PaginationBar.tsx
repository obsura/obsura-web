import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/common/UI";

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  disabled?: boolean;
}

export default function PaginationBar({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationBarProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3 py-2">
      <p className="text-xs text-stone-500">
        Showing <span className="font-medium text-stone-700">{start}</span>-
        <span className="font-medium text-stone-700">{end}</span> of{" "}
        <span className="font-medium text-stone-700">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Prev
        </Button>

        <span className="text-xs font-medium text-stone-600">
          Page {page} / {Math.max(totalPages, 1)}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
