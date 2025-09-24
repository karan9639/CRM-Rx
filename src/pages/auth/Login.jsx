"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { authenticateUser } from "@/utils/demoCredentials";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { login, setLoading, setError, clearError, isLoading, error } =
    useAuthStore();
  const navigate = useNavigate();

  const emailError =
    (submitted || email) && !isValidEmail(email) ? "Enter a valid email." : "";
  const passwordError =
    (submitted || password) && password.length < 6
      ? "Password must be at least 6 characters."
      : "";

  const canSubmit = isValidEmail(email) && password.length >= 6 && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    clearError();

    if (!canSubmit) return;

    setLoading(true);
    try {
      console.log("[v0] Attempting login with:", { email, password });

      // Simulate API delay for better UX
      await new Promise((r) => setTimeout(r, 700));

      const user = authenticateUser(email, password);

      if (user) {
        console.log("[v0] Login successful for user:", user.name);

        // Login user through auth store
        login({
          id: user.id,
          name: user.name,
          role: user.role,
          phone: user.phone,
          email: user.email,
        });

        // Navigate based on user role
        const redirectPath = user.role === "admin" ? "/admin" : "/sales";
        console.log("[v0] Redirecting to:", redirectPath);
        navigate(redirectPath);
      } else {
        console.log("[v0] Login failed - invalid credentials");
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("[v0] Login error:", error);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">CRM System</h1>
          <p className="text-slate-400">Professional Sales Management</p>
        </div>

        {/* Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/60 shadow-2xl rounded-2xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in with your email and password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Demo credentials info */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium mb-2">
                Demo Credentials:
              </p>
              <div className="text-xs text-blue-200 space-y-1">
                <div>Admin: admin@crm.com / admin123</div>
                <div>Sales: rajesh@crm.com / sales123</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </span>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError(); // Clear error when user starts typing
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className="pl-10 h-11 bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-400 rounded-xl"
                  />
                </div>
                {emailError ? (
                  <p
                    id="email-error"
                    className="text-rose-400 text-sm"
                    role="alert"
                    aria-live="polite"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </span>

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError(); // Clear error when user starts typing
                    }}
                    aria-invalid={!!passwordError}
                    aria-describedby={
                      passwordError ? "password-error" : undefined
                    }
                    className="pl-10 pr-10 h-11 bg-slate-700/50 border-slate-600/60 text-white placeholder:text-slate-400 rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError ? (
                  <p
                    id="password-error"
                    className="text-rose-400 text-sm"
                    role="alert"
                    aria-live="polite"
                  >
                    {passwordError}
                  </p>
                ) : null}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!canSubmit}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-slate-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Create Account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
