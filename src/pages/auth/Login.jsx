"use client";

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Building2, Users, Shield, TrendingUp } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated } = useAuthStore();
  const { users, initialize } = useDataStore();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [selectedUser, setSelectedUser] = useState("");

  // Initialize data store on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter users based on selected role
  const availableUsers = users.filter((user) => user.role === selectedRole);

  // Auto-select first user when role changes
  useEffect(() => {
    if (availableUsers.length > 0) {
      setSelectedUser(availableUsers[0].id);
    }
  }, [selectedRole, availableUsers]);

  const handleLogin = () => {
    const user = users.find((u) => u.id === selectedUser);
    if (user) {
      login(user);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CRM System</h1>
          <p className="text-slate-400 text-lg">
            Professional Sales Management
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Select your role and account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label htmlFor="role" className="text-white font-medium">
                Role
              </Label>
              <Select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl"
              >
                <option value="admin">Administrator</option>
                <option value="sales">Sales Representative</option>
              </Select>
            </div>

            {/* User Selection */}
            <div className="space-y-3">
              <Label htmlFor="user" className="text-white font-medium">
                User Account
              </Label>
              <Select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl"
              >
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200"
              disabled={!selectedUser}
            >
              <Users className="mr-2 h-5 w-5" />
              Sign In to Dashboard
            </Button>

            {/* Demo Info */}
            <div className="text-center text-sm text-slate-400 bg-slate-700/30 rounded-xl p-3">
              <p>Demo Application - No authentication required</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">Admin Features</h3>
            </div>
            <ul className="text-slate-300 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Assign tasks to sales team</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Monitor daily activities</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Manage companies & contacts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>View comprehensive reports</span>
              </li>
            </ul>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Sales Features</h3>
            </div>
            <ul className="text-slate-300 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>View assigned tasks</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Check-in/out with GPS</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Submit visit reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Track visit history</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
