import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../api/api";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token    = getAdminToken();

  // ✅ No token → redirect to login
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ✅ Must be a real JWT (3 dot-separated parts)
  // Blocks the old hardcoded "adminToken = true" string
  const isValidJWT = token.split(".").length === 3;
  if (!isValidJWT) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ✅ Check expiry by decoding payload (no secret needed for this)
  try {
    const payload   = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } catch {
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
