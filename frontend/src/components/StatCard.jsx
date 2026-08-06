export default function StatCard({ icon: Icon, label, value, color = "brand" }) {
  const colorMap = {
    brand: "bg-brand-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="card p-4 sm:p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center text-white shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-xs sm:text-sm text-navy-900/50 font-medium truncate">{label}</div>
        <div className="text-xl sm:text-2xl font-bold text-navy-900">{value}</div>
      </div>
    </div>
  );
}
