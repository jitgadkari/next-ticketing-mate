"use client";

import React, { useState, useMemo } from 'react';

interface TableProps<T> {
  columns: string[];
  data: T[];
  renderRow: (item: T) => JSX.Element;
}

const Table = <T extends { [key: string]: any }>({ columns, data, renderRow }: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = useMemo(() => {
    let sortableData = [...data];
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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const hideSpecificColumns=['State','Country','Contact','Phone', 'Type Employee', 'Decision', 'Created Date', 'Updated Date', 'Current Step','Status']
  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              onClick={() => requestSort(column.toLowerCase())}
              className={`px-6 py-4 border-b border-gray-200 bg-gray-50 text-left text-sm leading-4 font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 ${
                hideSpecificColumns.includes(column) ? 'hidden sm:table-cell' : 'table-cell'
              }`}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr key={index}>{renderRow(item)}</tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
