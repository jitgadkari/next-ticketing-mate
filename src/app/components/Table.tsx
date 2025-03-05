"use client";

import React, { useState, useMemo } from 'react';
import { FilterState } from '../intrendapp/tickets/TicketList';

interface TableProps<T> {
  columns: string[];
  data: T[] | null | undefined; // Handles potential null/undefined cases
  renderRow: (item: T) => JSX.Element;
  handleChangeSortOrder?: () => void;
}

const Table = <T extends { [key: string]: any }>({ columns, data, renderRow, handleChangeSortOrder }: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  console.log("Table Data:", data); // Debugging to check data
  console.log("Type of Data:", typeof data);
  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(data) ? [...data] : []; // Ensure it's always an array
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const hideSpecificColumns = [
    'State', 'Country', 'Contact', 'Phone', 'Type Employee',
    'Decision', 'Created Date', 'Updated Date', 'Current Step', 'Status'
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                onClick={() => {
                  // Check if the column is 'Created Date' and toggle sort order
                  if (column === 'Created Date' && handleChangeSortOrder) {
                    handleChangeSortOrder();
                  }
                }}
                className={`px-6 py-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 ${
                  hideSpecificColumns.includes(column) ? 'hidden sm:table-cell' : 'table-cell'
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => <tr key={index}>{renderRow(item)}</tr>)
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-500 py-4">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
