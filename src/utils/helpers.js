export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const getRiskColor = (risk) => {
  const map = { Critical: "red", High: "red", Medium: "yellow", Low: "green" };
  return map[risk] || "blue";
};

export const getRiskBadge = (risk) => {
  const map = { Critical: "badge-red", High: "badge-red", Medium: "badge-yellow", Low: "badge-green" };
  return map[risk] || "badge-blue";
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return "text-red-600";
  if (confidence >= 70) return "text-yellow-600";
  return "text-green-600";
};

export const truncate = (str, n = 30) => (str?.length > n ? str.slice(0, n) + "..." : str);

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => password?.length >= 8;
