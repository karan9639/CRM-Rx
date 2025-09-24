import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/useAuthStore"
import { ToastProvider } from "./components/ui/toast"
import Login from "./pages/auth/Login"
import AdminLayout from "./components/layouts/AdminLayout"
import SalesLayout from "./components/layouts/SalesLayout"
import PrivateRoute from "./components/auth/PrivateRoute"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import UsersList from "./pages/admin/UsersList"
import AssignTask from "./pages/admin/AssignTask"
import CompaniesList from "./pages/admin/CompaniesList"
import CompanyDetail from "./pages/admin/CompanyDetail"
import AllTasks from "./pages/admin/AllTasks"
import Settings from "./pages/admin/Settings"

// Sales Pages
import SalesDashboard from "./pages/sales/SalesDashboard"
import MyTasks from "./pages/sales/MyTasks"
import VisitForm from "./pages/sales/VisitForm"
import History from "./pages/sales/History"

function App() {
  const { user } = useAuthStore()

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="assign-task" element={<AssignTask />} />
            <Route path="companies" element={<CompaniesList />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="tasks" element={<AllTasks />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Sales Routes */}
          <Route
            path="/sales"
            element={
              <PrivateRoute requiredRole="sales">
                <SalesLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<SalesDashboard />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="visit/:taskId" element={<VisitForm />} />
            <Route path="history" element={<History />} />
          </Route>

          {/* Default redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === "admin" ? "/admin" : "/sales"} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
