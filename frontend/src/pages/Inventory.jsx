import { useEffect, useState } from "react";
import { Plus, Trash2, Boxes } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import api from "../api/axios";

const CONDITION_STYLE = { new: "badge-green", good: "badge-green", fair: "badge-orange", damaged: "badge-red" };
const emptyForm = { name: "", category: "", quantity: 1, unit: "pcs", location: "", condition: "good", purchase_date: "" };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/inventory").then((res) => setItems(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/inventory", form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to add item."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (window.confirm("Delete this item?")) { await api.delete(`/inventory/${id}`); load(); } };

  const columns = [
    { key: "name", label: "Item", render: (i) => <span className="font-medium">{i.name}</span> },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity", exportValue: (i) => `${i.quantity} ${i.unit}`, render: (i) => `${i.quantity} ${i.unit}` },
    { key: "location", label: "Location" },
    { key: "condition", label: "Condition", render: (i) => <span className={`badge ${CONDITION_STYLE[i.condition]} capitalize`}>{i.condition}</span> },
    { key: "purchase_date", label: "Purchase Date" },
  ];

  return (
    <DashboardLayout title="Inventory / Asset Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2"><Boxes size={16} /> Track school equipment, furniture & supplies.</p>
        <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> Add Item</button>
      </div>

      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            searchPlaceholder="Search inventory..."
            exportFileName="inventory"
            actionsColumn={(i) => <button onClick={() => handleDelete(i.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Item name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-input" /></div>
            <div><label className="form-label">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="form-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="form-input" /></div>
            <div><label className="form-label">Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="form-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="form-input">
                <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option><option value="damaged">Damaged</option>
              </select>
            </div>
            <div><label className="form-label">Purchase date</label><input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="form-input" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Item"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
