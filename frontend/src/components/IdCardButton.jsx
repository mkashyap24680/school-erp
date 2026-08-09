import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { IdCard, Download } from "lucide-react";
import Modal from "./Modal";

export default function IdCardButton({
  person,
  type = "Student",
  schoolName = "Your School Name",
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [90, 55],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 90, 55);
      pdf.save(`${person.name.replace(/\s+/g, "_")}_ID_Card.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const initials = person.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const studentClass = person.SchoolClass || person.schoolClass;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60"
        title="Generate ID Card"
      >
        <IdCard size={16} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${type} ID Card`}
        wide
      >
        <div className="flex flex-col items-center gap-4">

          {/* ID CARD */}
          <div
            ref={cardRef}
            style={{
              width: "100%",
              maxWidth: "520px",
              minHeight: "420px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eef0f4",
              overflow: "hidden",
              fontFamily: "system-ui, sans-serif",
              color: "#0f1b3d",
            }}
          >

            {/* HEADER */}
            <div
              style={{
                background: "#0f1b3d",
                color: "#fff",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: "#2f9e44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                S
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {schoolName}
              </div>
            </div>

            {/* MAIN STUDENT INFO */}
            <div
              style={{
                display: "flex",
                gap: 16,
                padding: "18px",
              }}
            >

              {/* INITIALS */}
              <div
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  background: "#e7f7ea",
                  color: "#2f9e44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 25,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              {/* BASIC DETAILS */}
              <div
                style={{
                  fontSize: 12,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 3,
                  }}
                >
                  {person.name}
                </div>

                <div
                  style={{
                    opacity: 0.6,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {type}
                </div>

                {person.roll_no && (
                  <div>
                    Roll No: <b>{person.roll_no}</b>
                  </div>
                )}

                {person.admission_no && (
                  <div>
                    Admission No: <b>{person.admission_no}</b>
                  </div>
                )}
              </div>
            </div>

            {/* COURSE INFORMATION */}
            {studentClass && (
              <div
                style={{
                  borderTop: "1px solid #eef0f4",
                  padding: "12px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#2f9e44",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Academic Information
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {studentClass.course_name || "-"}
                  {studentClass.course_code
                    ? ` (${studentClass.course_code})`
                    : ""}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    marginTop: 3,
                  }}
                >
                  {studentClass.department_name || "-"}
                  {studentClass.department_code
                    ? ` (${studentClass.department_code})`
                    : ""}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 7,
                    fontSize: 11,
                  }}
                >
                  {studentClass.year && (
                    <span>
                      Year: <b>{studentClass.year}</b>
                    </span>
                  )}

                  {studentClass.semester && (
                    <span>
                      Semester: <b>{studentClass.semester}</b>
                    </span>
                  )}

                  {studentClass.session && (
                    <span>
                      Session: <b>{studentClass.session}</b>
                    </span>
                  )}

                  {studentClass.section && (
                    <span>
                      Section: <b>{studentClass.section}</b>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STUDENT INFORMATION */}
            <div
              style={{
                borderTop: "1px solid #eef0f4",
                padding: "12px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#2f9e44",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Student Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: 20,
                  rowGap: 5,
                  fontSize: 11,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {person.dob && (
                  <div>
                    DOB: <b>{person.dob}</b>
                  </div>
                )}

                {person.gender && (
                  <div>
                    Gender: <b>{person.gender}</b>
                  </div>
                )}

                {person.phone && (
                  <div>
                    Student Phone: <b>{person.phone}</b>
                  </div>
                )}

                {person.email && (
                  <div>
                    Email: <b>{person.email}</b>
                  </div>
                )}

                {person.parent_name && (
                  <div>
                    Parent Name: <b>{person.parent_name}</b>
                  </div>
                )}

                {person.parent_phone && (
                  <div>
                    Parent Phone: <b>{person.parent_phone}</b>
                  </div>
                )}
              </div>

              {person.address && (
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 11,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  Address: <b>{person.address}</b>
                </div>
              )}
            </div>

          </div>

          {/* DOWNLOAD */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
          >
            <Download size={16} />
            {downloading ? "Generating..." : "Download PDF"}
          </button>

        </div>
      </Modal>
    </>
  );
}
