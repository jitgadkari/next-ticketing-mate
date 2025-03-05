import React from "react";

interface PaginationProps {
  limit: number;
  offset: number;
  total_items?: number | string | null; 
  current_page?: number | null;
  total_pages?: number | null;
  has_next?: boolean | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageChange: (page: number) => void;
}

function Pagination({
  limit,
  offset,
  total_items,
  current_page,
  total_pages,
  has_next,
  onPrevious,
  onNext,
  onPageChange,
}: PaginationProps) {
  const renderPageNumbers = () => {
    const pages = [];
    const current = current_page || 1;
    const total = total_pages || 1;

    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(total, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(i);
          }}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === current ? "bg-indigo-600 text-white" : "text-gray-900"
          } ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis if necessary
    if (startPage > 1) {
      pages.unshift(
        <span
          key="ellipsis-start"
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
        >
          ...
        </span>
      );
      pages.unshift(
        <button
          key="1"
          onClick={() => {
            onPageChange(1);
          }}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          1
        </button>
      );
    }

    if (endPage < total) {
      pages.push(
        <span
          key="ellipsis-end"
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
        >
          ...
        </span>
      );
      pages.push(
        <button
          key={total}
          onClick={() => {
            onPageChange(total);
          }}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          {total}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="bg-white">
    
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between items-center sm:hidden">
        <button
          onClick={onPrevious}
          disabled={current_page === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <p className="sm:hidden">{current_page}/{total_pages}</p>
        <button
          onClick={onNext}
          disabled={!has_next}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{offset + 1}</span> to{" "}
            <span className="font-medium">
            {Math.min(offset + limit, typeof total_items === "string" ? parseInt(total_items, 10) : total_items || 0)}
            </span>{" "}
            of <span className="font-medium">{total_items}</span> results
          </p>
        </div>
        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          >
            <button
              onClick={onPrevious}
              disabled={current_page === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              {"<"}
            </button>

          
            {renderPageNumbers()}

            <button
              onClick={onNext}
              disabled={!has_next}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              {">"}
            </button>
          </nav>
        </div>
      </div>
    </div>
    <p className="sm:hidden text-sm text-gray-700 text-center pb-2">
            Showing <span className="font-medium">{offset + 1}</span> to{" "}
            <span className="font-medium">
            {Math.min(offset + limit, typeof total_items === "string" ? parseInt(total_items, 10) : total_items || 0)}
            </span>{" "}
            of <span className="font-medium">{total_items}</span> results
          </p>
    </div>
  );
}

export default Pagination;
