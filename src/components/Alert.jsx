import { useEffect } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

const icons = { success: FiCheckCircle, error: FiAlertCircle, warning: FiAlertTriangle, info: FiInfo };
const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};
const iconStyles = { success: "text-green-500", error: "text-red-500", warning: "text-yellow-500", info: "text-blue-500" };

const Alert = ({ type = "info", message, onClose, autoClose = false }) => {
  const Icon = icons[type];

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} animate-fade-in`}>
      <Icon className={`mt-0.5 flex-shrink-0 ${iconStyles[type]}`} size={18} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
