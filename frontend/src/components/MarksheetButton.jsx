import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import api from "../api/axios";

/**
 * Fetches a student's exam results and generates a printable marksheet PDF.
 */
export default function MarksheetButton({ studentId, studentName, className, fetchUrl }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.get(fetchUrl || `/exams/results/me`);
      const results = res.data;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Your School Name", 105, 18, { align: "center" });
      doc.setFontSize(11);
      doc.text("Academic Marksheet", 105, 26, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Student: ${studentName}`, 14, 38);
      if (className) doc.text(`Class: ${className}`, 14, 44);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, className ? 50 : 44);

      const rows = results.map((r) => [
        r.Exam?.name || "—",
        r.Exam?.subject || "—",
        r.Exam?.exam_date || "—",
        `${r.marks_obtained} / ${r.Exam?.total_marks || ""}`,
      ]);

      const totalObtained = results.reduce((s, r) => s + Number(r.marks_obtained || 0), 0);
      const totalMax = results.reduce((s, r) => s + Number(r.Exam?.total_marks || 0), 0);
      const percentage = totalMax ? ((totalObtained / totalMax) * 100).toFixed(1) : "0";

      autoTable(doc, {
        startY: className ? 56 : 50,
        head: [["Exam", "Subject", "Date", "Marks"]],
        body: rows.length ? rows : [["No results available yet.", "", "", ""]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 27, 61] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.text(`Total: ${totalObtained} / ${totalMax}`, 14, finalY);
      doc.text(`Percentage: ${percentage}%`, 14, finalY + 7);

      doc.save(`${studentName.replace(/\s+/g, "_")}_Marksheet.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60" title="Download Marksheet">
      <FileText size={15} />
    </button>
  );
}
