import { useState, useEffect } from "react";
import ReceiptButton from "../components/ReceiptButton";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({
    student_name: "",
    title: "",
    category: "Tuition",
    amount: "",
    paid_amount: "",
    status: "pending"
  });

  const categories = ["Tuition", "Transport", "Hostel", "Library", "Exam", "Other"];

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setForm({
      ...form,
      category: selectedCat,
      title: `${selectedCat} Fee`
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Student Fees</h1>
      
      {/* Fee Addition Form */}
      <form className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Fee Category</label>
          <select
            value={form.category}
            onChange={handleCategoryChange}
            className="w-full p-2 border rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Fee Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. Transport Fee"
          />
        </div>

        {/* Baki Form Fields */}
      </form>

      {/* Fee Records Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Paid</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => (
            <tr key={fee.id} className="text-center">
              <td className="p-2 border">{fee.student_name}</td>
              <td className="p-2 border">{fee.title}</td>
              <td className="p-2 border">{fee.category || "Tuition"}</td>
              <td className="p-2 border">₹{fee.amount}</td>
              <td className="p-2 border">₹{fee.paid_amount}</td>
              <td className="p-2 border">
                {Number(fee.paid_amount) > 0 && (
                  <ReceiptButton fee={fee} studentName={fee.student_name} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
