import { ReactNode } from "react";

interface Column {
  name: string;
  key: string;
  render?: (row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  return (
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((col, index) => (
            <th
              key={index}
              className="px-4 py-2 text-left font-semibold text-gray-700"
            >
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            {columns.map((col, colIndex) => (
              <td key={colIndex} className="px-4 py-2">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
