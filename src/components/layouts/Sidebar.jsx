"use client"

import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  ClipboardList,
  Settings,
  Calendar,
  History,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 lg:justify-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">CRM System</h2>
                <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent",
                  )
                }
              >
                <item.icon className={cn("h-5 w-5 transition-colors", "group-hover:text-purple-400")} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
