import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

/**
 * Private route component that protects routes based on authentication and role
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'admin'|'sales'} [props.requiredRole]
 */
export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === "admin" ? "/admin" : "/sales"
    return <Navigate to={redirectPath} replace />
  }

  return children
}
