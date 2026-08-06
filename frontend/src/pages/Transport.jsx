import { useEffect, useState } from "react";
import { Plus, Trash2, Bus, Route as RouteIcon } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Transport() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentTransport />;
  return <StaffTransport />;
}

function StudentTransport() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transport/routes/me").then((res) => setRoute(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Transport">
      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : !route ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">
          You are not assigned to any transport route yet.
        </div>
      ) : (
        <div className="card p-6 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
            <Bus size={22} />
          </div>
          <h2 className="text-lg font-bold text-navy-900 mb-1">{route.name}</h2>
          <p className="text-sm text-navy-900/60 mb-4">Stops: {route.stops || "—"}</p>
          <div className="text-sm space-y-1 text-navy-900/70">
            <div>Vehicle: {route.Vehicle?.vehicle_number || "—"}</div>
            <div>Driver: {route.Vehicle?.driver_name || "—"}</div>
            <div>Driver phone: {route.Vehicle?.driver_phone || "—"}</div>
            <div>Monthly fee: ₹{Number(route.monthly_fee).toLocaleString()}</div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const emptyVehicle = { vehicle_number: "", driver_name: "", driver_phone: "", capacity: 40 };
const emptyRoute = { name: "", stops: "", vehicle_id: "", monthly_fee: 0 };
const emptyAssign = { student_id: "", route_id: "" };

function StaffTransport() {
  const { user } = useAuth();
  const canDelete = user?.role === "admin";
  const [tab, setTab] = useState("routes");

  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vehicleModal, setVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [routeModal, setRouteModal] = useState(false);
  const [routeForm, setRouteForm] = useState(emptyRoute);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssign);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/transport/vehicles"), api.get("/transport/routes"), api.get("/students")])
      .then(([vRes, rRes, sRes]) => { setVehicles(vRes.data); setRoutes(rRes.data); setStudents(sRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/transport/vehicles", vehicleForm);
      setVehicleModal(false); setVehicleForm(emptyVehicle); load();
    } catch (err) { setError(err.response?.data?.message || "Failed to add vehicle."); }
    finally { setSaving(false); }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/transport/routes", { ...routeForm, vehicle_id: routeForm.vehicle_id || null });
      setRouteModal(false); setRouteForm(emptyRoute); load();
    } catch (err) { setError(err.response?.data?.message || "Failed to add route."); }
    finally { setSaving(false); }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/transport/assign", { ...assignForm, route_id: assignForm.route_id || null });
      setAssignModal(false); setAssignForm(emptyAssign); load();
    } catch (err) { setError(err.response?.data?.message || "Failed to assign student."); }
    finally { setSaving(false); }
  };

  const handleDeleteVehicle = async (id) => { if (window.confirm("Delete this vehicle?")) { await api.delete(`/transport/vehicles/${id}`); load(); } };
  const handleDeleteRoute = async (id) => { if (window.confirm("Delete this route?")) { await api.delete(`/transport/routes/${id}`); load(); } };

  return (
    <DashboardLayout title="Transport Management">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab("routes")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "routes" ? "bg-navy-900 text-white" : "bg-white text-navy-900/60 border border-[#e2e5ea]"}`}><RouteIcon size={14} className="inline mr-1.5 -mt-0.5" />Routes</button>
        <button onClick={() => setTab("vehicles")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "vehicles" ? "bg-navy-900 text-white" : "bg-white text-navy-900/60 border border-[#e2e5ea]"}`}><Bus size={14} className="inline mr-1.5 -mt-0.5" />Vehicles</button>
        <div className="flex-1" />
        {tab === "routes" ? (
          <>
            <button onClick={() => { setAssignForm(emptyAssign); setError(""); setAssignModal(true); }} className="btn-outline">Assign Student</button>
            <button onClick={() => { setRouteForm(emptyRoute); setError(""); setRouteModal(true); }} className="btn-primary"><Plus size={16} /> Add Route</button>
          </>
        ) : (
          <button onClick={() => { setVehicleForm(emptyVehicle); setError(""); setVehicleModal(true); }} className="btn-primary"><Plus size={16} /> Add Vehicle</button>
        )}
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : tab === "routes" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.length === 0 && <div className="card p-8 text-center text-navy-900/40 text-sm col-span-full">No routes created yet.</div>}
          {routes.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-navy-900">{r.name}</h3>
                  <p className="text-xs text-navy-900/50 mt-1">Stops: {r.stops || "—"}</p>
                </div>
                {canDelete && <button onClick={() => handleDeleteRoute(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>}
              </div>
              <div className="text-sm text-navy-900/60 mt-3 space-y-1">
                <div>Vehicle: {r.Vehicle?.vehicle_number || "Unassigned"}</div>
                <div>Monthly fee: ₹{Number(r.monthly_fee).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-4 sm:p-5 overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Vehicle No</th><th>Driver</th><th>Phone</th><th>Capacity</th>{canDelete && <th>Actions</th>}</tr></thead>
            <tbody>
              {vehicles.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">No vehicles added yet.</td></tr>}
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{v.vehicle_number}</td>
                  <td>{v.driver_name || "—"}</td>
                  <td>{v.driver_phone || "—"}</td>
                  <td>{v.capacity}</td>
                  {canDelete && <td><button onClick={() => handleDeleteVehicle(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={vehicleModal} onClose={() => setVehicleModal(false)} title="Add Vehicle">
        <form onSubmit={handleVehicleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Vehicle number</label><input required value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Driver name</label><input value={vehicleForm.driver_name} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Driver phone</label><input value={vehicleForm.driver_phone} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Capacity</label><input type="number" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setVehicleModal(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Vehicle"}</button></div>
        </form>
      </Modal>

      <Modal open={routeModal} onClose={() => setRouteModal(false)} title="Add Route">
        <form onSubmit={handleRouteSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Route name</label><input required value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Stops (comma separated)</label><input value={routeForm.stops} onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Vehicle</label>
            <select value={routeForm.vehicle_id} onChange={(e) => setRouteForm({ ...routeForm, vehicle_id: e.target.value })} className="form-input">
              <option value="">Unassigned</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
            </select>
          </div>
          <div><label className="form-label">Monthly fee (₹)</label><input type="number" value={routeForm.monthly_fee} onChange={(e) => setRouteForm({ ...routeForm, monthly_fee: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setRouteModal(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Route"}</button></div>
        </form>
      </Modal>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Student to Route">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Student</label>
            <select required value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} className="form-input">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="form-label">Route</label>
            <select value={assignForm.route_id} onChange={(e) => setAssignForm({ ...assignForm, route_id: e.target.value })} className="form-input">
              <option value="">Unassign</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setAssignModal(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Assign"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
