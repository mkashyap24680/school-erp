import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import api from "../api/axios";

const STATUS_OPTIONS = ["new", "contacted", "converted", "rejected"];
const STATUS_STYLE = { new: "badge-orange", contacted: "badge-gray", converted: "badge-green", rejected: "badge-red" };

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get("/enquiries").then((res) => setEnquiries(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const updateStatus = async (id, status) => { await api.put(`/enquiries/${id}`, { status }); load(); };

  const columns = [
    { key: "name", label: "Name", render: (e) => <span className="font-medium">{e.name}</span> },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "class_applying", label: "Class Applying" },
    { key: "message", label: "Message", render: (e) => <span className="text-xs text-navy-900/50 line-clamp-1">{e.message}</span> },
    {
      key: "status", label: "Status",
      render: (e) => (
        <select value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value)} className={`badge ${STATUS_STYLE[e.status]} capitalize border-0 cursor-pointer`}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    { key: "created_at", label: "Received", render: (e) => new Date(e.created_at).toLocaleDateString() },
  ];

  return (
    <DashboardLayout title="Admissions / Enquiries">
      <p className="text-navy-900/50 text-sm flex items-center gap-2 mb-4">
        <UserPlus size={16} /> Manage enquiries from prospective students. Share the public form link:{" "}
        <code className="bg-[#f0f2f5] px-1.5 py-0.5 rounded">{window.location.origin}/admissions</code>
      </p>
      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable columns={columns} rows={enquiries} searchPlaceholder="Search enquiries..." exportFileName="enquiries" />
        )}
      </div>
    </DashboardLayout>
  );
}
