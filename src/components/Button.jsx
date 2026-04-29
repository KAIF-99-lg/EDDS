import { FiLoader } from "react-icons/fi";

const Button = ({ children, variant = "primary", loading = false, disabled = false, className = "", type = "button", onClick, size = "md" }) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 font-medium px-4 py-2 rounded-xl transition-all duration-200",
  };
  const sizes = { sm: "!px-4 !py-2 !text-sm", md: "", lg: "!px-8 !py-3.5 !text-lg" };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${(disabled || loading) ? "opacity-60 cursor-not-allowed" : ""} ${className} inline-flex items-center justify-center gap-2`}
    >
      {loading && <FiLoader className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

export default Button;
