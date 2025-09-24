"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { MobileNavToggle } from "@/components/ui/mobile-nav"
import { LogOut, User, Bell, Settings, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30 safe-area-inset-top">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
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

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden sm:flex touch-target focus-enhanced focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl hidden sm:flex touch-target focus-enhanced focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 md:space-x-3 px-2 sm:px-3 md:px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 touch-target"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="p-1 sm:p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex-shrink-0">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-sm hidden sm:block min-w-0">
                <div className="font-medium text-white truncate max-w-[80px] md:max-w-[120px] lg:max-w-none mobile-text-wrap">
                  {user?.name}
                </div>
                <div className="text-slate-400 capitalize truncate text-xs">{user?.role}</div>
              </div>
              <ChevronDown
                className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50">
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-700/50">
                    <div className="font-medium text-white text-sm">{user?.name}</div>
                    <div className="text-slate-400 text-xs capitalize">{user?.role}</div>
                  </div>

                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors sm:hidden">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </button>

                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors sm:hidden">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 rounded-xl flex-shrink-0 touch-target focus-enhanced focus:outline-none focus:ring-2 focus:ring-red-500/50 touch-feedback hidden md:flex"
          >
            <LogOut className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} aria-hidden="true" />}
    </header>
  )
}
