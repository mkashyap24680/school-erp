import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Award, Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";

const TEMPLATES = {
  bonafide: {
    label: "Bonafide Certificate",
    body: (s, extra) =>
      `This is to certify that ${s.name}, ${s.gender === "female" ? "daughter" : "son"} of ${s.parent_name || "___________"}, ` +
      `bearing Admission No. ${s.admission_no || "___________"}, is a bonafide student of this institution, ` +
      `studying in Class ${s.className || "___________"} for the academic year ${extra.year}.\n\n` +
      `This certificate is issued upon the request of the student for the purpose of ${extra.purpose || "official use"}.`,
  },
  transfer: {
    label: "Transfer Certificate",
    body: (s, extra) =>
      `This is to certify that ${s.name}, Admission No. ${s.admission_no || "___________"}, was a student of Class ${s.className || "___________"} ` +
      `at this institution and is being relieved from the rolls of this school with effect from ${extra.date}.\n\n` +
      `Reason for leaving: ${extra.purpose || "___________"}.\n\nConduct: Good.`,
  },
  character: {
    label: "Character Certificate",
    body: (s, extra) =>
      `This is to certify that ${s.name}, Admission No. ${s.admission_no || "___________"}, studied in Class ${s.className || "___________"} ` +
      `at this institution during the academic year ${extra.year}. During this period, their conduct and character were found to be good.\n\n` +
      `This certificate is issued for the purpose of ${extra.purpose || "official use"}.`,
  },
};

export default function Certificates() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState("bonafide");
  const [purpose, setPurpose] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  const handleGenerate = () => {
    const student = students.find((s) => String(s.id) === studentId);
    if (!student) return;

    const s = { ...student, className: student.SchoolClass ? `${student.SchoolClass.name} ${student.SchoolClass.section}` : "" };
    const template = TEMPLATES[type];
    const bodyText = template.body(s, { purpose, year, date });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Your School Name", 105, 25, { align: "center" });
    doc.setFontSize(13);
    doc.text(template.label.toUpperCase(), 105, 36, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(60, 40, 150, 40);

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(bodyText, 170);
    doc.text(lines, 20, 60);

    const finalY = 60 + lines.length * 7 + 20;
    doc.text(`Date: ${date}`, 20, finalY);
    doc.text("Principal / Authorized Signatory", 130, finalY + 25);

    doc.save(`${student.name.replace(/\s+/g, "_")}_${type}_certificate.pdf`);
  };

  return (
    <DashboardLayout title="Certificate Generator">
      <p className="text-navy-900/50 text-sm flex items-center gap-2 mb-4">
        <Award size={16} /> Generate printable certificates for students.
      </p>

      <div className="card p-6 max-w-xl space-y-4">
        <div>
          <label className="form-label">Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="form-input">
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Certificate type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="form-input">
            {Object.entries(TEMPLATES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{type === "transfer" ? "Relieving date" : "Academic year"}</label>
            {type === "transfer" ? (
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            ) : (
              <input value={year} onChange={(e) => setYear(e.target.value)} className="form-input" />
            )}
          </div>
          <div>
            <label className="form-label">Purpose / reason</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Passport application" className="form-input" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={!studentId} className="btn-primary w-full justify-center">
          <Download size={16} /> Generate & Download PDF
        </button>
      </div>
    </DashboardLayout>
  );
}
