import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generic data table.
 *
 * columns: [{ key, label, render?(row), sortValue?(row), exportValue?(row) }]
 * rows: array of data objects
 * searchableKeys: which row fields the search box filters on (dot-path ok via accessor)
 */
export default function DataTable({
  columns,
  rows,
  searchPlaceholder = "Search...",
  pageSize = 8,
  exportFileName = "export",
  actionsColumn, // optional render(row) for an actions cell, shown as last column
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = col.render ? col.exportValue?.(row) ?? "" : row[col.key];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [rows, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const getVal = col?.sortValue || ((row) => row[sortKey]);
    return [...filtered].sort((a, b) => {
      const av = getVal(a) ?? "";
      const bv = getVal(b) ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const exportRows = () =>
    sorted.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.label] = col.exportValue ? col.exportValue(row) : row[col.key];
      });
      return obj;
    });

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(exportFileName, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [columns.map((c) => c.label)],
      body: sorted.map((row) => columns.map((col) => String((col.exportValue ? col.exportValue(row) : row[col.key]) ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 27, 61] },
    });
    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="form-input pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="btn-outline text-xs sm:text-sm">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={handleExportPdf} className="btn-outline text-xs sm:text-sm">
            <Download size={15} /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-navy-900"
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                    ) : null}
                  </button>
                </th>
              ))}
              {actionsColumn && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + (actionsColumn ? 1 : 0)} className="text-center py-8 text-navy-900/40">No records found.</td></tr>
            )}
            {paged.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? "—"}</td>
                ))}
                {actionsColumn && <td>{actionsColumn(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-navy-900/60">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#e2e5ea] disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 text-xs font-semibold">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#e2e5ea] disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
