import { Navigate, useLocation } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken")
  const location = useLocation()

  if (!token) {
    // ✅ FIX: Save attempted URL so we can redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
