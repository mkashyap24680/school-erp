import { useEffect, useState } from "react";
import { UserPlus, Filter } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import api from "../api/axios";

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "converted",
  "rejected",
];

const STATUS_STYLE = {
  new: "badge-orange",
  contacted: "badge-gray",
  converted: "badge-green",
  rejected: "badge-red",
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status filter
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);

    api
      .get("/enquiries")
      .then((res) => {
        setEnquiries(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load enquiries:", err);
        setEnquiries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}`, { status });
      load();
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
    }
  };

  // ---------------------------------------------
  // FILTER ENQUIRIES BY STATUS
  // ---------------------------------------------
  const filteredEnquiries =
    statusFilter === "all"
      ? enquiries
      : enquiries.filter(
          (enquiry) => enquiry.status === statusFilter
        );

  // ---------------------------------------------
  // TABLE COLUMNS
  // ---------------------------------------------
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (e) => (
        <span className="font-medium text-navy-900">
          {e.name || "—"}
        </span>
      ),
    },

    {
      key: "phone",
      label: "Phone",
      render: (e) => e.phone || "—",
    },

    {
      key: "email",
      label: "Email",
      render: (e) => e.email || "—",
    },

    {
      key: "class_applying",
      label: "Class Applying",
      render: (e) => e.class_applying || "—",
    },

    {
      key: "message",
      label: "Message",
      render: (e) => (
        <span
          className="block max-w-xs truncate"
          title={e.message || ""}
        >
          {e.message || "—"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (e) => (
        <select
          value={e.status || "new"}
          onChange={(ev) =>
            updateStatus(e.id, ev.target.value)
          }
          className={`badge ${
            STATUS_STYLE[e.status] || "badge-gray"
          } capitalize border-0 cursor-pointer outline-none`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },

    {
      key: "created_at",
      label: "Received",
      render: (e) => {
        if (!e.created_at) return "—";

        const date = new Date(e.created_at);

        if (Number.isNaN(date.getTime())) {
          return "Invalid Date";
        }

        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <DashboardLayout title="Admissions / Enquiries">
      <div className="space-y-5">

        {/* ------------------------------------------------ */}
        {/* PAGE DESCRIPTION */}
        {/* ------------------------------------------------ */}

        <div className="flex items-center gap-2 text-sm text-navy-900/70">
          <UserPlus size={18} />

          <span>
            Manage enquiries from prospective students. Share the
            public form link:
          </span>

          <span className="font-mono text-xs bg-[#f7f8fa] px-2 py-1 rounded-md text-navy-900">
            {window.location.origin}/admissions
          </span>
        </div>

        {/* ------------------------------------------------ */}
        {/* STATUS FILTER */}
        {/* ------------------------------------------------ */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-2">
            <Filter
              size={17}
              className="text-navy-900/50"
            />

            <span className="text-sm font-semibold text-navy-900">
              Filter by Status
            </span>
          </div>

          <div className="flex items-center gap-2">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="form-input w-full sm:w-48"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="new">
                New
              </option>

              <option value="contacted">
                Contacted
              </option>

              <option value="converted">
                Converted
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* RESULT COUNT */}
        {/* ------------------------------------------------ */}

        {!loading && (
          <div className="text-xs text-navy-900/50">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {filteredEnquiries.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">
              {enquiries.length}
            </span>{" "}
            enquiries
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* DATA TABLE */}
        {/* ------------------------------------------------ */}

        {loading ? (
          <div className="card p-8 text-center text-sm text-navy-900/40">
            Loading...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEnquiries}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
