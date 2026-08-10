import { useEffect, useState } from "react";
import { UserPlus, Filter } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
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
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);

    try {
      const res = await api.get("/enquiries");
      setEnquiries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}`, { status });
      await load();
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
    }
  };

  const filteredEnquiries =
    statusFilter === "all"
      ? enquiries
      : enquiries.filter(
          (enquiry) => enquiry.status === statusFilter
        );

  return (
    <DashboardLayout title="Admission Enquiries">
      <div className="space-y-5">

        {/* Page description */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-navy-900/70">
          <UserPlus size={18} />

          <span>
            Manage enquiries from prospective students.
            Share the public form link:
          </span>

          <span className="font-mono text-xs bg-[#f7f8fa] px-2 py-1 rounded-md text-navy-900">
            {window.location.origin}/admissions
          </span>
        </div>

        {/* Status Filter */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-2">
              <Filter
                size={17}
                className="text-navy-900/50"
              />

              <div>
                <p className="text-sm font-semibold text-navy-900">
                  Filter Enquiries
                </p>

                <p className="text-xs text-navy-900/50">
                  Filter enquiries by their current status.
                </p>
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-full sm:w-52"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>

          </div>
        </div>

        {/* Result count */}
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

        {/* Loading */}
        {loading ? (
          <div className="card p-8 text-center text-sm text-navy-900/40">
            Loading enquiries...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="card p-8 text-center">
            <UserPlus
              size={32}
              className="mx-auto mb-3 text-navy-900/20"
            />

            <p className="text-sm font-semibold text-navy-900">
              No enquiries found
            </p>

            <p className="text-xs text-navy-900/40 mt-1">
              Try selecting a different status filter.
            </p>
          </div>
        ) : (
          /* Enquiries Table */
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Class Applying</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id}>

                      {/* Name */}
                      <td>
                        <span className="font-semibold">
                          {enquiry.name || "—"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td>
                        {enquiry.phone || "—"}
                      </td>

                      {/* Email */}
                      <td>
                        {enquiry.email || "—"}
                      </td>

                      {/* Class */}
                      <td>
                        {enquiry.class_applying || "—"}
                      </td>

                      {/* Message */}
                      <td>
                        <span
                          className="block max-w-xs truncate"
                          title={enquiry.message || ""}
                        >
                          {enquiry.message || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <select
                          value={enquiry.status || "new"}
                          onChange={(e) =>
                            updateStatus(
                              enquiry.id,
                              e.target.value
                            )
                          }
                          className={`badge ${
                            STATUS_STYLE[
                              enquiry.status
                            ] || "badge-gray"
                          } capitalize border-0 cursor-pointer outline-none`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td>
                        {enquiry.created_at
                          ? new Date(
                              enquiry.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
