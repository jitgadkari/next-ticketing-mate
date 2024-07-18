import React from 'react';

interface TableProps {
  columns: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
}

const Table: React.FC<TableProps> = ({ columns, data, renderRow }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className="border p-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border p-2">
            {renderRow(item)}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
