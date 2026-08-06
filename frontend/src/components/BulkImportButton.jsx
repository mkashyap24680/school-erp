import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import Modal from "./Modal";
import api from "../api/axios";

/**
 * Lets the user pick a .csv/.xlsx file, previews the parsed rows, then posts
 * them to the given bulk-import endpoint in one request.
 *
 * expectedColumns: array of { key, label } describing what the backend expects.
 */
export default function BulkImportButton({ endpoint, payloadKey, expectedColumns, onDone }) {
  const fileRef = useRef(null);
  const [rows, setRows] = useState(null);
  const [importing, setImporting] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setRows(json);
      setResultMsg("");
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await api.post(endpoint, { [payloadKey]: rows });
      setResultMsg(`Imported ${res.data.created} record(s).${res.data.errors?.length ? ` ${res.data.errors.length} row(s) had errors.` : ""}`);
      onDone?.();
    } catch (err) {
      setResultMsg(err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const close = () => {
    setRows(null);
    setResultMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <button onClick={() => fileRef.current?.click()} className="btn-outline">
        <Upload size={16} /> Bulk Import
      </button>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />

      <Modal open={!!rows} onClose={close} title="Bulk Import Preview" wide>
        <p className="text-xs text-navy-900/50 mb-3">
          Expected columns: {expectedColumns.map((c) => c.label).join(", ")}. Found {rows?.length || 0} row(s).
        </p>
        {resultMsg && <div className="mb-3 text-sm bg-brand-100 text-brand-600 rounded-lg px-3 py-2">{resultMsg}</div>}
        <div className="overflow-x-auto max-h-80">
          <table className="data-table">
            <thead><tr>{expectedColumns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
            <tbody>
              {rows?.slice(0, 20).map((r, i) => (
                <tr key={i}>{expectedColumns.map((c) => <td key={c.key}>{r[c.key] ?? "—"}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows?.length > 20 && <p className="text-xs text-navy-900/40 mt-2">Showing first 20 of {rows.length} rows.</p>}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={close} className="btn-outline">Close</button>
          <button onClick={handleImport} disabled={importing} className="btn-primary">{importing ? "Importing..." : `Import ${rows?.length || 0} Rows`}</button>
        </div>
      </Modal>
    </>
  );
}
