"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { MobileNavToggle } from "@/components/ui/mobile-nav"
import { LogOut, User, Bell, Settings } from "lucide-react"

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30 safe-area-inset-top">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 min-w-0 flex-1">
          <MobileNavToggle isOpen={sidebarOpen} onToggle={setSidebarOpen} className="touch-target" />

          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white truncate mobile-text-wrap">
              {user?.role === "admin" ? "Admin Dashboard" : "Sales Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block truncate mobile-text-wrap">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden md:flex touch-target focus-enhanced"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden md:flex touch-target focus-enhanced"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm hidden sm:block min-w-0">
              <div className="font-medium text-white truncate max-w-[100px] md:max-w-none mobile-text-wrap">
                {user?.name}
              </div>
              <div className="text-slate-400 capitalize truncate">{user?.role}</div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 rounded-xl flex-shrink-0 touch-target focus-enhanced touch-feedback"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
