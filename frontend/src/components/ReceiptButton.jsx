import { useState } from "react";
import jsPDF from "jspdf";
import { Receipt, FileStack } from "lucide-react";
import { useSchoolProfile } from "../context/SchoolProfileContext";

// Builds a student "meta" object (class/section, roll no, admission no) from
// either a Fee row's nested `Student` (admin table) or a raw Student profile
// (student's own /fees/me response). Keeps the two callers in sync.
function extractStudentMeta(student) {
  if (!student) return {};
  const cls = student.SchoolClass;
  return {
    name: student.name,
    rollNo: student.roll_no,
    admissionNo: student.admission_no,
    className: cls ? `${cls.name}${cls.section ? " - " + cls.section : ""}` : "",
  };
}

// Shared PDF layout. `items` is always an array of one or more fee records so
// the same function renders a single-item receipt or a full, itemized
// receipt covering every fee record for a student (S.No / Particulars /
// Amount), matching a standard institute fee receipt.
function buildReceiptDoc({ items, meta, schoolName }) {
  const doc = new jsPDF({ format: "a5" });
  const pageWidth = 148;
  const centerX = pageWidth / 2;

  doc.setFontSize(15);
  doc.text(schoolName, centerX, 16, { align: "center" });
  doc.setFontSize(10);
  doc.text(items.length > 1 ? "CONSOLIDATED FEE RECEIPT" : "FEE PAYMENT RECEIPT", centerX, 23, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(12, 27, 136, 27);

  const latestPaymentDate = items
    .map((f) => f.payment_date)
    .filter(Boolean)
    .sort()
    .pop();
  const receiptNo = `RCPT-${items.map((f) => f.id).join("-")}-${new Date(latestPaymentDate || Date.now()).getFullYear()}`;

  doc.setFontSize(9);
  doc.text(`Receipt No: ${receiptNo}`, 12, 35);
  doc.text(`Date: ${latestPaymentDate || new Date().toISOString().slice(0, 10)}`, 100, 35);

  doc.text(`Student Name: ${meta.name || "-"}`, 12, 42);
  doc.text(`Class: ${meta.className || "-"}`, 100, 42);
  doc.text(`Roll No: ${meta.rollNo || "-"}`, 12, 48);
  doc.text(`Admission No: ${meta.admissionNo || "-"}`, 100, 48);

  doc.setLineWidth(0.2);
  doc.line(12, 53, 136, 53);

  // Itemized table header
  let y = 60;
  doc.setFont(undefined, "bold");
  doc.text("S.No", 14, y);
  doc.text("Particulars", 30, y);
  doc.text("Paid Amount", 124, y, { align: "right" });
  doc.setFont(undefined, "normal");
  y += 3;
  doc.line(12, y, 136, y);
  y += 6;

  let totalPaid = 0;
  let totalDue = 0;
  items.forEach((f, idx) => {
    const paid = Number(f.paid_amount) || 0;
    const balance = Number(f.amount) - paid;
    totalPaid += paid;
    totalDue += balance;
    doc.text(String(idx + 1), 14, y);
    doc.text(f.title, 30, y);
    doc.text(`Rs.${paid.toLocaleString()}`, 124, y, { align: "right" });
    y += 7;
  });

  y += 1;
  doc.line(12, y, 136, y);
  y += 7;

  doc.setFont(undefined, "bold");
  doc.text("Total Paid", 30, y);
  doc.text(`Rs.${totalPaid.toLocaleString()}`, 124, y, { align: "right" });
  doc.setFont(undefined, "normal");
  y += 7;

  if (totalDue > 0) {
    doc.text("Balance Due", 30, y);
    doc.text(`Rs.${totalDue.toLocaleString()}`, 124, y, { align: "right" });
    y += 7;
  }

  doc.setFontSize(8);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    centerX,
    y + 10,
    { align: "center" }
  );

  return { doc, receiptNo };
}

/**
 * Downloads a receipt for a single fee record. Kept for the per-row action
 * button so a staff member can still print one payment on its own.
 */
export function ReceiptButton({ fee, student, studentName }) {
  const { profile } = useSchoolProfile();
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    try {
      const meta = { ...extractStudentMeta(student), name: student?.name || studentName };
      const { doc } = buildReceiptDoc({
        items: [fee],
        meta,
        schoolName: profile?.school_name || "Your School Name",
      });
      doc.save(`Receipt_${(meta.name || "Student").replace(/\s+/g, "_")}_${fee.title.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60" title="Download Receipt">
      <Receipt size={15} />
    </button>
  );
}

/**
 * Downloads ONE consolidated receipt covering every fee record passed in
 * (e.g. all of a student's records: Tuition, Transport, Exam Fee...), each
 * shown as its own line item — instead of a separate PDF per row.
 */
export function ConsolidatedReceiptButton({ fees, student, studentName, label = "Full Receipt" }) {
  const { profile } = useSchoolProfile();
  const [loading, setLoading] = useState(false);

  const payableFees = fees.filter((f) => Number(f.paid_amount) > 0);

  const handleGenerate = () => {
    setLoading(true);
    try {
      const meta = { ...extractStudentMeta(student), name: student?.name || studentName };
      const { doc } = buildReceiptDoc({
        items: payableFees,
        meta,
        schoolName: profile?.school_name || "Your School Name",
      });
      doc.save(`Receipt_${(meta.name || "Student").replace(/\s+/g, "_")}_Consolidated.pdf`);
    } finally {
      setLoading(false);
    }
  };

  if (payableFees.length === 0) return null;

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60 inline-flex items-center gap-1 text-xs font-medium"
      title="Download one receipt covering all fee records for this student"
    >
      <FileStack size={15} /> {label}
    </button>
  );
}

export default ReceiptButton;
