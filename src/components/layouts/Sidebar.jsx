"use client"

import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserPlus, Building2, ClipboardList, Settings, Calendar, History } from "lucide-react"
import { MobileNav } from "@/components/ui/mobile-nav"

const adminNavItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Sales Team" },
  { to: "/admin/assign-task", icon: UserPlus, label: "Assign Task" },
  { to: "/admin/companies", icon: Building2, label: "Companies" },
  { to: "/admin/tasks", icon: ClipboardList, label: "All Tasks" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

const salesNavItems = [
  { to: "/sales", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/sales/tasks", icon: Calendar, label: "My Tasks" },
  { to: "/sales/history", icon: History, label: "History" },
]

export default function Sidebar({ role, sidebarOpen, setSidebarOpen }) {
  const navItems = role === "admin" ? adminNavItems : salesNavItems

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:bg-slate-900/50 lg:backdrop-blur-xl lg:border-r lg:border-slate-700/50",
        )}
      >
        <div className="p-4 lg:p-6 h-full overflow-y-auto mobile-scroll">
          <div className="flex items-center space-x-3 mb-6 lg:mb-8">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">CRM System</h2>
              <p className="text-xs text-slate-400 capitalize truncate">{role} Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group w-full focus-enhanced",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent",
                  )
                }
              >
                <item.icon className={cn("h-5 w-5 transition-colors flex-shrink-0", "group-hover:text-purple-400")} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <MobileNav
        items={navItems}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        title="CRM System"
        subtitle={`${role} Portal`}
      />
    </>
  )
}
