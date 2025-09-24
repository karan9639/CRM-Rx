"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell, Settings, Menu } from "lucide-react"

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-800/50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">
              {user?.role === "admin" ? "Admin Dashboard" : "Sales Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden md:flex"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden md:flex"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm hidden sm:block">
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-slate-400 capitalize">{user?.role}</div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 rounded-xl"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
