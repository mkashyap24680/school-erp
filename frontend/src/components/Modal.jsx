import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-xl`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <button onClick={onClose} className="text-navy-900/50 hover:text-navy-900">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
