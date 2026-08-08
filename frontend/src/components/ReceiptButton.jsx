import { useState } from "react";
import jsPDF from "jspdf";
import { Receipt } from "lucide-react";
import { useSchoolProfile } from "../context/SchoolProfileContext";

/**
 * Generates a printable payment receipt PDF for a single fee record.
 */
export default function ReceiptButton({ fee, studentName }) {
  const { profile } = useSchoolProfile();
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ format: "a5" });
      const schoolName = profile?.school_name || "Your School Name";

      doc.setFontSize(16);
      doc.text(schoolName, 74, 18, { align: "center" });
      doc.setFontSize(11);
      doc.text("FEE PAYMENT RECEIPT", 74, 26, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(15, 30, 133, 30);

      doc.setFontSize(10);
      const receiptNo = `RCPT-${fee.id}-${new Date(fee.payment_date || fee.updated_at || Date.now()).getFullYear()}`;
      doc.text(`Receipt No: ${receiptNo}`, 15, 40);
      doc.text(`Date: ${fee.payment_date || new Date().toISOString().slice(0, 10)}`, 100, 40);

      doc.text(`Student Name: ${studentName}`, 15, 50);
      doc.text(`Fee Title: ${fee.title}`, 15, 58);

      doc.setLineWidth(0.2);
      doc.line(15, 66, 133, 66);

      doc.text(`Total Fee Amount:`, 15, 76);
      doc.text(`₹${Number(fee.amount).toLocaleString()}`, 120, 76, { align: "right" });

      doc.text(`Amount Paid:`, 15, 84);
      doc.text(`₹${Number(fee.paid_amount).toLocaleString()}`, 120, 84, { align: "right" });

      const balance = Number(fee.amount) - Number(fee.paid_amount);
      doc.text(`Balance Due:`, 15, 92);
      doc.text(`₹${balance.toLocaleString()}`, 120, 92, { align: "right" });

      doc.setFontSize(9);
      doc.text(`Status: ${fee.status.toUpperCase()}`, 15, 102);

      doc.setFontSize(8);
      doc.text("This is a computer-generated receipt and does not require a signature.", 74, 118, { align: "center" });

      doc.save(`Receipt_${studentName.replace(/\s+/g, "_")}_${fee.title.replace(/\s+/g, "_")}.pdf`);
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
