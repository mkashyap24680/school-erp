import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { IdCard, Download } from "lucide-react";
import Modal from "./Modal";

/**
 * Renders a printable ID card preview for a student or teacher and lets the
 * user download it as a PDF (captured via html2canvas -> jsPDF image embed).
 */
export default function IdCardButton({ person, type = "Student", schoolName = "Your School Name" }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [90, 55] });
      pdf.addImage(imgData, "PNG", 0, 0, 90, 55);
      pdf.save(`${person.name.replace(/\s+/g, "_")}_ID_Card.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const initials = person.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60" title="Generate ID Card">
        <IdCard size={15} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`${type} ID Card`}>
        <div className="flex flex-col items-center gap-4">
          <div
            ref={cardRef}
            style={{
              width: "340px",
              height: "208px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eef0f4",
              overflow: "hidden",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <div style={{ background: "#0f1b3d", color: "#fff", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#2f9e44", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>S</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{schoolName}</div>
            </div>
            <div style={{ display: "flex", gap: 14, padding: "16px 14px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "#e7f7ea", color: "#2f9e44",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ fontSize: 12, color: "#0f1b3d" }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{person.name}</div>
                <div style={{ opacity: 0.6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 700 }}>{type}</div>
                {person.roll_no && <div style={{ marginTop: 6 }}>Roll No: <b>{person.roll_no}</b></div>}
                {person.admission_no && <div>Admission No: <b>{person.admission_no}</b></div>}
                {person.subject && <div style={{ marginTop: 6 }}>Subject: <b>{person.subject}</b></div>}
                {person.phone && <div>Phone: {person.phone}</div>}
              </div>
            </div>
          </div>

          <button onClick={handleDownload} disabled={downloading} className="btn-primary">
            <Download size={16} /> {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </Modal>
    </>
  );
}
