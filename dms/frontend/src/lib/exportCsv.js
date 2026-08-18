/**
 * Exports an array of flat objects to a downloaded CSV file. Deliberately
 * client-side and dependency-free: the report data is already in memory
 * (React Query already fetched it to render the table), so there's no need
 * for a server export endpoint or a PDF/CSV library — this is just
 * string-building and a Blob download.
 *
 * `columns` controls both the header row and the export order/labels,
 * independent of whatever keys happen to be on each row object.
 */
export const exportToCsv = (filename, rows, columns) => {
  if (!rows || rows.length === 0) return;

  const escapeCell = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    // Quote any cell containing a comma, quote, or newline; double up internal quotes.
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.accessor(row))).join(","))
    .join("\n");

  const csvContent = `${header}\n${body}`;

  // Leading BOM so Excel (a very likely destination for a business CSV
  // export) renders UTF-8 correctly instead of mangling non-ASCII text.
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
