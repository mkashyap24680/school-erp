import { useEffect, useState } from "react";
import { History } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import api from "../api/axios";

const ACTION_STYLE = {
  create: "badge-green",
  update: "badge-orange",
  delete: "badge-red",
  issue: "badge-orange",
  return: "badge-green",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/audit-logs").then((res) => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "created_at", label: "Timestamp", render: (l) => new Date(l.created_at).toLocaleString(), sortValue: (l) => new Date(l.created_at).getTime() },
    { key: "user_name", label: "User" },
    { key: "user_role", label: "Role", render: (l) => <span className="badge badge-gray capitalize">{l.user_role}</span> },
    { key: "action", label: "Action", render: (l) => <span className={`badge ${ACTION_STYLE[l.action] || "badge-gray"} capitalize`}>{l.action}</span> },
    { key: "entity", label: "Entity" },
    { key: "entity_id", label: "Entity ID" },
    { key: "details", label: "Details", render: (l) => <span className="text-xs text-navy-900/50">{l.details ? l.details.slice(0, 60) : "—"}</span> },
  ];

  return (
    <DashboardLayout title="Audit Log">
      <p className="text-navy-900/50 text-sm flex items-center gap-2 mb-4">
        <History size={16} /> Full activity history — who changed what, and when.
      </p>
      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable columns={columns} rows={logs} searchPlaceholder="Search activity..." exportFileName="audit-log" pageSize={12} />
        )}
      </div>
    </DashboardLayout>
  );
}
