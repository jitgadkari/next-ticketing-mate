"use client";

import React, { useState, useMemo } from "react";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableProps<T> {
  columns: string[];
  data: T[] | null | undefined;
  renderRow: (item: T) => JSX.Element;
  handleChangeSortOrder?: () => void;
}

const Table = <T extends { [key: string]: any }>({
  columns,
  data,
  renderRow,
  handleChangeSortOrder,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(data) ? [...data] : [];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const hideColumns = [
    "State", "Country", "Contact", "Phone", "Type Employee",
    "Decision", "Created Date", "Updated Date", "Current Step", "Status"
  ];

  return (
    <div className="overflow-x-auto border rounded-md ">
      <ShadTable>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                onClick={() => {
                  if (column === "Created Date" && handleChangeSortOrder) {
                    handleChangeSortOrder();
                  }
                }}
                className={`text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 px-4 py-2 ${
                  hideColumns.includes(column) ? "hidden sm:table-cell" : "table-cell"
                }`}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <TableRow key={index}>{renderRow(item)}</TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-gray-500 py-4">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ShadTable>
    </div>
  );
};

export default Table;
