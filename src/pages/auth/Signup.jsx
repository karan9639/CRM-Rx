"use client";

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Building2,
  Users,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function Signup() {
  const { isAuthenticated } = useAuthStore();
  const { addUser, users } = useDataStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "sales",
    department: "",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState({});

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name": {
        if (!value.trim()) newErrors.name = "Full name is required";
        else if (value.trim().length < 2)
          newErrors.name = "Name must be at least 2 characters";
        else delete newErrors.name;
        break;
      }

      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(value))
          newErrors.email = "Please enter a valid email address";
        else if (
          users.some((u) => u.email.toLowerCase() === value.toLowerCase())
        )
          newErrors.email = "Email already exists";
        else delete newErrors.email;
        break;
      }

      case "password": {
        if (!value) newErrors.password = "Password is required";
        else if (value.length < 6)
          newErrors.password = "Password must be at least 6 characters";
        else delete newErrors.password;

        if (formData.confirmPassword && value !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        else if (formData.confirmPassword && value === formData.confirmPassword)
          delete newErrors.confirmPassword;
        break;
      }

      case "confirmPassword": {
        if (!value) newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== value)
          newErrors.confirmPassword = "Passwords do not match";
        else delete newErrors.confirmPassword;
        break;
      }

      case "phone": {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        if (!value.trim()) newErrors.phone = "Phone number is required";
        else if (!phoneRegex.test(value.replace(/[\s\-()]/g, "")))
          newErrors.phone = "Please enter a valid phone number";
        else delete newErrors.phone;
        break;
      }

      case "department": {
        if (formData.role === "admin" && !value.trim())
          newErrors.department = "Department is required for admin role";
        else delete newErrors.department;
        break;
      }

      case "location": {
        if (!value.trim()) newErrors.location = "Location is required";
        else delete newErrors.location;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "phone",
      "location",
    ];
    if (formData.role === "admin") fields.push("department");

    let isValid = true;
    fields.forEach((f) => {
      if (!validateField(f, formData[f])) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "phone",
      "location",
    ];
    if (formData.role === "admin") allFields.push("department");
    setTouchedFields(Object.fromEntries(allFields.map((f) => [f, true])));

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 900));
      const newUser = {
        id: `user_${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department.trim() || null,
        location: formData.location.trim(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      addUser(newUser);
      setSuccessMessage("Account created successfully! You can now sign in.");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "sales",
        department: "",
        location: "",
      });
      setTouchedFields({});
    } catch {
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touchedFields[field])
      setTimeout(() => validateField(field, value), 300);
  };

  const handleFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
        </div>

        {successMessage && (
          <Card className="bg-green-500/10 border-green-500/30 shadow-lg">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">{successMessage}</p>
              </div>
              <div className="mt-4">
                <Link to="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 h-11">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-xl">Sign up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{errors.submit}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("name")}
                      className={`pl-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white font-medium">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 555 123 4567"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("phone")}
                      className={`pl-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleFieldBlur("email")}
                    className={`pl-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-white font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("password")}
                      className={`pl-11 pr-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-white font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("confirmPassword")}
                      className={`pl-11 pr-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role" className="text-white font-medium">
                    Role *
                  </Label>
                  <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11"
                    disabled={isSubmitting}
                  >
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </Select>
                </div>

                {formData.role === "admin" && (
                  <div>
                    <Label
                      htmlFor="department"
                      className="text-white font-medium"
                    >
                      Department *
                    </Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="e.g., Sales, Marketing, IT"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("department")}
                      className={`bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                        errors.department ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.department && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="text-white font-medium">
                  Location *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="City / Region"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("location")}
                    className={`pl-11 bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-11 ${
                      errors.location ? "border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.location && (
                  <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium rounded-xl h-11 shadow-lg shadow-purple-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Create Account
                  </div>
                )}
              </Button>

              <p className="text-center text-slate-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
