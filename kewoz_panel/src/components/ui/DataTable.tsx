import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

export type DataTableColumn<TData> = {
  id?: string;
  header: React.ReactNode;
  accessor?: keyof TData | ((row: TData) => React.ReactNode);
  cell?: (row: TData) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

export type SortDirection = "ASC" | "DESC";

export type DataTableProps<TData> = {
  data: TData[];
  columns: Array<DataTableColumn<TData>>;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  className?: string;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sortColumnIndex?: number | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnIndex: number | null, direction: SortDirection) => void;
  serverPagination?: boolean;
};

type SortState<TData> = {
  columnIndex: number | null;
  direction: "ASC" | "DESC";
  sortFn?: (a: TData, b: TData) => number;
};

function getCellValue<TData>(row: TData, col: DataTableColumn<TData>): React.ReactNode {
  if (col.cell) return col.cell(row);
  if (typeof col.accessor === "function") return col.accessor(row);
  if (typeof col.accessor === "string") return (row as any)[col.accessor as string] as React.ReactNode;
  return null;
}

export function DataTable<TData>({
  data,
  columns,
  pageSizeOptions = [10, 20, 30],
  defaultPageSize = 10,
  className,
  currentPage: controlledPage,
  itemsPerPage: controlledPageSize,
  totalItems: controlledTotalItems,
  onPageChange: onPageChangeProp,
  onPageSizeChange: onPageSizeChangeProp,
  sortColumnIndex: controlledSortColumnIndex,
  sortDirection: controlledSortDirection,
  onSortChange: onSortChangeProp,
  serverPagination = false,
}: DataTableProps<TData>) {
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalPageSize, setInternalPageSize] = useState<number>(defaultPageSize);

  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const pageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize;

  const handlePageChange = (newPage: number) => {
    if (onPageChangeProp) onPageChangeProp(newPage);
    else setInternalPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChangeProp) onPageSizeChangeProp(newPageSize);
    else {
      setInternalPageSize(newPageSize);
      setInternalPage(1);
    }
  };

  const [internalSort, setInternalSort] = useState<SortState<TData>>({
    columnIndex: null,
    direction: "ASC",
  });
  const [query] = useState<string>("");

  const sort = {
    columnIndex: controlledSortColumnIndex !== undefined ? controlledSortColumnIndex : internalSort.columnIndex,
    direction: controlledSortDirection !== undefined ? controlledSortDirection : internalSort.direction,
  };

  const onHeaderClick = (colIndex: number, col: DataTableColumn<TData>) => {
    if (!col.sortable) return;
    const newDirection =
      sort.columnIndex === colIndex ? (sort.direction === "ASC" ? "DESC" : "ASC") : "ASC";
    if (onSortChangeProp) onSortChangeProp(colIndex, newDirection);
    else setInternalSort({ columnIndex: colIndex, direction: newDirection });
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);

  const sorted = useMemo(() => {
    if (sort.columnIndex == null) return filtered;
    const col = columns[sort.columnIndex];
    if (!col) return filtered;

    const getVal = (row: TData) => {
      if (typeof col.accessor === "function") return col.accessor(row);
      if (typeof col.accessor === "string") return (row as any)[col.accessor];
      if (col.cell) return col.cell(row) as any;
      return undefined;
    };

    const isValidDate = (val: any): boolean => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    };

    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);

      if (av == null && bv == null) return 0;
      if (av == null) return sort.direction === "ASC" ? -1 : 1;
      if (bv == null) return sort.direction === "ASC" ? 1 : -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sort.direction === "ASC" ? av - bv : bv - av;
      }

      if (
        (av instanceof Date || (typeof av === "string" && isValidDate(av))) &&
        (bv instanceof Date || (typeof bv === "string" && isValidDate(bv)))
      ) {
        const aTime = av instanceof Date ? av.getTime() : new Date(av).getTime();
        const bTime = bv instanceof Date ? bv.getTime() : new Date(bv).getTime();
        return sort.direction === "ASC" ? aTime - bTime : bTime - aTime;
      }

      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      return sort.direction === "ASC" ? as.localeCompare(bs) : bs.localeCompare(as);
    });

    return copy;
  }, [filtered, sort, columns]);

  const totalItems = controlledTotalItems !== undefined ? controlledTotalItems : sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = serverPagination ? sorted : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">{/* controls if needed */}</div>
      </div>

      {/* Outer container creates the visual gap from the header strip to border */}
      <div className="overflow-x-auto rounded-lg border border-table-divider bg-secondary p-2">
        <table className="min-w-full border-separate border-spacing-0">
          {/* HEADER WRAPPER */}
          <thead>
            <tr className="bg-table-header-bg rounded-md">
              {columns.map((col, idx) => (
                <th
                  key={col.id ?? idx}
                  onClick={() => col.sortable && onHeaderClick(idx, col)}
                  className={cn(
                    "px-3 py-5 text-left font-medium text-table-header-text uppercase tracking-wide select-none whitespace-nowrap",
                    col.className,
                    col.sortable && "cursor-pointer",
                    idx === 0
                      ? "pl-6 pr-4 rounded-l-md" // first col rounded left
                      : idx === columns.length - 1
                        ? "pl-4 pr-6 rounded-r-md" // last col rounded right
                        : "px-4"
                  )}
                >
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <span className="text-sm font-medium text-table-header-text uppercase tracking-wide w-full max-w-[200px]">
                      {col.header}
                    </span>
                    {col.sortable && (
                      <span className="inline-flex items-center flex-shrink-0">
                        {sort.columnIndex === idx ? (
                          sort.direction === "ASC" ? (
                            <GoTriangleUp className="text-table-header-text" />
                          ) : (
                            <GoTriangleDown className="text-table-header-text" />
                          )
                        ) : (
                          <GoTriangleDown className="text-text-muted" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-text-muted" colSpan={columns.length}>
                  No results
                </td>
              </tr>
            )}

            {pageData.map((row, rIndex) => (
              <tr
                key={rIndex}
                className={cn(
                  rIndex % 2 === 0 ? "bg-table-row" : "bg-table-row-alt",
                  "hover:bg-table-row-hover"
                )}
              >
                {columns.map((col, cIndex) => (
                  <td
                    key={(col.id ?? cIndex) + "-" + rIndex}
                    className={cn(
                      "px-4 py-3 text-sm text-table-text border-b border-table-divider",
                      cIndex === 0 ? "pl-6" : cIndex === columns.length - 1 ? "pr-6" : "",
                      rIndex === pageData.length - 1 ? "border-b-0" : "",
                      col.className
                    )}
                  >
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-sm">
        <div className="text-text-muted flex justify-center items-center gap-4 ">
          <div>
            <select
              className="h-8 rounded border bg-secondary px-2 text-sm"
              value={pageSize}
              aria-label="Rows per page"
              onChange={(e) => {
                handlePageSizeChange(Number(e.target.value));
                handlePageChange(1);
              }}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
          <div>
            Showing {pageData.length ? 1 : 0}-{Math.min(sorted.length, page * pageSize)} of {totalItems || sorted.length} results
          </div>
        </div>

        <div className="inline-flex items-center gap-1">
          <button
            className="px-3 py-1 font-bold text-text-secondary disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(1, page - 1))}
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            <button
              className={cn(
                "h-8 w-8 rounded text-sm font-medium",
                1 === currentPage ? "bg-primary text-button-text rounded-full" : "hover:bg-primary/80 hover:text-button-text hover:rounded-full"
              )}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>

            {currentPage > 3 && totalPages > 4 && <span className="px-1">...</span>}

            {(() => {
              const pages = [];
              let startPage = Math.max(2, currentPage - 1);
              let endPage = Math.min(totalPages - 1, currentPage + 1);
              if (currentPage <= 3) endPage = Math.min(4, totalPages - 1);
              else if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 3);
              for (let i = startPage; i <= endPage; i++) {
                if (i > 1 && i < totalPages) {
                  pages.push(
                    <button
                      key={i}
                      className={cn(
                        "h-8 w-8 rounded text-sm font-medium",
                        i === currentPage ? "bg-primary text-button-text rounded-full" : "hover:bg-primary/80 hover:text-button-text hover:rounded-full"
                      )}
                      onClick={() => handlePageChange(i)}
                    >
                      {i}
                    </button>
                  );
                }
              }
              return pages;
            })()}

            {currentPage < totalPages - 2 && totalPages > 4 && <span className="px-1">...</span>}

            {totalPages > 1 && (
              <button
                className={cn(
                  "h-8 w-8 rounded text-sm font-medium",
                  totalPages === currentPage ? "bg-primary text-button-text rounded-full" : "hover:bg-primary/80 hover:text-button-text hover:rounded-full"
                )}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            className="px-3 py-1 font-bold text-text-secondary disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;