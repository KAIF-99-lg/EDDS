import { Outlet } from "react-router-dom";

// Auth removed — all routes are publicly accessible
const ProtectedRoute = ({ children }) => children || <Outlet />;

export default ProtectedRoute;
