const Card = ({ children, className = "", hover = false, glass = false }) => (
  <div className={`${glass ? "glass" : "card"} ${hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""} ${className}`}>
    {children}
  </div>
);

export const StatCard = ({ icon, label, value, change, color = "blue", loading = false }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        )}
        {change && <p className={`text-xs mt-0.5 ${change > 0 ? "text-green-600" : "text-red-600"}`}>{change > 0 ? "↑" : "↓"} {Math.abs(change)}% this month</p>}
      </div>
    </Card>
  );
};

export default Card;
