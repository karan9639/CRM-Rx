"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Settings } from "lucide-react";

export default function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.role === "admin" ? "Admin Dashboard" : "Sales Dashboard"}
            </h1>
            <p className="text-sm text-slate-400">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 rounded-xl"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm">
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
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
