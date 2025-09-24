"use client"

import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Building2, Users, Shield, TrendingUp, UserPlus } from "lucide-react"

export default function Login() {
  const { login, isAuthenticated } = useAuthStore()
  const { users, initialize } = useDataStore()
  const [selectedRole, setSelectedRole] = useState("admin")
  const [selectedUser, setSelectedUser] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize data store on component mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Filter users based on selected role
  const availableUsers = users.filter((user) => user.role === selectedRole)

  // Auto-select first user when role changes
  useEffect(() => {
    if (availableUsers.length > 0) {
      setSelectedUser(availableUsers[0].id)
    } else {
      setSelectedUser("")
    }
  }, [selectedRole, availableUsers])

  const handleLogin = async () => {
    const user = users.find((u) => u.id === selectedUser)
    if (user) {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 800))
      login(user)
      setIsLoading(false)
    }
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">CRM System</h1>
          <p className="text-slate-400 text-base sm:text-lg">Professional Sales Management</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-white text-lg sm:text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400 text-sm sm:text-base">
              Select your role and account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Role Selection */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="role" className="text-white font-medium text-sm sm:text-base">
                Role
              </Label>
              <Select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 sm:h-12 text-sm sm:text-base"
              >
                <option value="admin">Administrator</option>
                <option value="sales">Sales Representative</option>
              </Select>
            </div>

            {/* User Selection */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="user" className="text-white font-medium text-sm sm:text-base">
                User Account
              </Label>
              {availableUsers.length > 0 ? (
                <Select
                  id="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                >
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="p-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-slate-400 text-sm text-center">
                  No {selectedRole} users available
                </div>
              )}
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 sm:py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200 text-sm sm:text-base h-11 sm:h-12"
              disabled={!selectedUser || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Sign In to Dashboard
                </>
              )}
            </Button>

            {/* Signup Link */}
            <div className="text-center pt-2">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Create Account
                </Link>
              </p>
            </div>

            {/* Demo Info */}
            <div className="text-center text-xs sm:text-sm text-slate-400 bg-slate-700/30 rounded-xl p-3">
              <p>Demo Application - No authentication required</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
              <h3 className="font-semibold text-white text-sm sm:text-base">Admin Features</h3>
            </div>
            <ul className="text-slate-300 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Assign tasks to sales team</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Monitor daily activities</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Manage companies & contacts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>View comprehensive reports</span>
              </li>
            </ul>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              <h3 className="font-semibold text-white text-sm sm:text-base">Sales Features</h3>
            </div>
            <ul className="text-slate-300 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>View assigned tasks</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Check-in/out with GPS</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Submit visit reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Track visit history</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
