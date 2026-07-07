export default function Table({ columns, rows, emptyText = "No records found." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-surface-container text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline bg-white">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-surface-low">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-secondary" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
