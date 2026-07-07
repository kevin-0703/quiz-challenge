import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button.jsx";

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <p className="text-sm text-secondary">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronRight}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
