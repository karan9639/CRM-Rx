"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Building2,
  Users,
  Shield,
  TrendingUp,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"

export default function Signup() {
  const { isAuthenticated } = useAuthStore()
  const { addUser, users } = useDataStore()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "sales",
    department: "",
    location: "",
  })

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [touchedFields, setTouchedFields] = useState({})

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors }

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required"
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters"
        } else {
          delete newErrors.name
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.email = "Email is required"
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address"
        } else if (users.some((user) => user.email.toLowerCase() === value.toLowerCase())) {
          newErrors.email = "Email already exists"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "Password is required"
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters"
        } else {
          delete newErrors.password
        }
        // Re-validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== value) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break

      case "phone":
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
        if (!value.trim()) {
          newErrors.phone = "Phone number is required"
        } else if (!phoneRegex.test(value.replace(/[\s\-()]/g, ""))) {
          newErrors.phone = "Please enter a valid phone number"
        } else {
          delete newErrors.phone
        }
        break

      case "department":
        if (formData.role === "admin" && !value.trim()) {
          newErrors.department = "Department is required for admin role"
        } else {
          delete newErrors.department
        }
        break

      case "location":
        if (!value.trim()) {
          newErrors.location = "Location is required"
        } else {
          delete newErrors.location
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form validation
  const validateForm = () => {
    const fields = ["name", "email", "password", "confirmPassword", "phone", "location"]
    if (formData.role === "admin") fields.push("department")

    let isValid = true
    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })

    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched
    const allFields = ["name", "email", "password", "confirmPassword", "phone", "location"]
    if (formData.role === "admin") allFields.push("department")
    setTouchedFields(Object.fromEntries(allFields.map((field) => [field, true])))

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create new user
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
      }

      // Add user to store
      addUser(newUser)

      // Show success message
      setSuccessMessage("Account created successfully! You can now sign in.")

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "sales",
        department: "",
        location: "",
      })
      setTouchedFields({})
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({ submit: "Failed to create account. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (touchedFields[field]) {
      setTimeout(() => validateField(field, value), 300)
    }
  }

  const handleFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20">
              <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Join CRM System</h1>
          <p className="text-slate-400 text-base sm:text-lg">Create your professional account</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="bg-success/10 border-success/30 shadow-lg mobile-fade-in">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <p className="text-success font-medium text-sm sm:text-base">{successMessage}</p>
              </div>
              <div className="mt-4">
                <Link to="/auth/login">
                  <Button className="w-full bg-success hover:bg-success/90 h-10 sm:h-11 text-sm sm:text-base">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Form */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-white text-lg sm:text-xl">Create Account</CardTitle>
            <CardDescription className="text-slate-400 text-sm sm:text-base">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="mobile-form space-y-4 sm:space-y-6">
              {/* General Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{errors.submit}</span>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-medium text-base sm:text-lg border-b border-slate-700/50 pb-2">
                  Personal Information
                </h3>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Full Name */}
                  <div className="mobile-form-group flex-1">
                    <Label htmlFor="name" className="text-white font-medium text-sm sm:text-base">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onBlur={() => handleFieldBlur("name")}
                        className={`pl-10 sm:pl-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                          errors.name ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.name && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div className="mobile-form-group flex-1">
                    <Label htmlFor="phone" className="text-white font-medium text-sm sm:text-base">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        onBlur={() => handleFieldBlur("phone")}
                        className={`pl-10 sm:pl-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                          errors.phone ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.phone && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="mobile-form-group">
                  <Label htmlFor="email" className="text-white font-medium text-sm sm:text-base">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      className={`pl-10 sm:pl-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                        errors.email ? "border-destructive focus:border-destructive" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-medium text-base sm:text-lg border-b border-slate-700/50 pb-2">
                  Account Security
                </h3>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Password */}
                  <div className="mobile-form-group flex-1">
                    <Label htmlFor="password" className="text-white font-medium text-sm sm:text-base">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onBlur={() => handleFieldBlur("password")}
                        className={`pl-10 sm:pl-12 pr-10 sm:pr-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                          errors.password ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white mobile-touch-target"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="mobile-form-group flex-1">
                    <Label htmlFor="confirmPassword" className="text-white font-medium text-sm sm:text-base">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        onBlur={() => handleFieldBlur("confirmPassword")}
                        className={`pl-10 sm:pl-12 pr-10 sm:pr-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                          errors.confirmPassword ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white mobile-touch-target"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-medium text-base sm:text-lg border-b border-slate-700/50 pb-2">
                  Professional Information
                </h3>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Role */}
                  <div className="mobile-form-group flex-1">
                    <Label htmlFor="role" className="text-white font-medium text-sm sm:text-base">
                      Role *
                    </Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl h-10 sm:h-11 text-sm sm:text-base"
                      disabled={isSubmitting}
                    >
                      <option value="sales">Sales Representative</option>
                      <option value="admin">Administrator</option>
                    </Select>
                  </div>

                  {/* Department (conditional) */}
                  {formData.role === "admin" && (
                    <div className="mobile-form-group flex-1">
                      <Label htmlFor="department" className="text-white font-medium text-sm sm:text-base">
                        Department *
                      </Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="e.g., Sales, Marketing, IT"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        onBlur={() => handleFieldBlur("department")}
                        className={`bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                          errors.department ? "border-destructive focus:border-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.department && (
                        <p className="text-destructive text-xs sm:text-sm mt-1">{errors.department}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="mobile-form-group">
                  <Label htmlFor="location" className="text-white font-medium text-sm sm:text-base">
                    Location *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter your city/region"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      onBlur={() => handleFieldBlur("location")}
                      className={`pl-10 sm:pl-12 bg-slate-700/50 border-slate-600/50 text-white rounded-xl mobile-xs-input h-10 sm:h-11 text-sm sm:text-base ${
                        errors.location ? "border-destructive focus:border-destructive" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.location && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3 sm:py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200 mobile-xs-button h-11 sm:h-12 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Create Account
                  </div>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-slate-400 text-xs sm:text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/auth/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
              <h3 className="font-semibold text-white text-sm sm:text-base">Admin Benefits</h3>
            </div>
            <ul className="text-slate-300 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Full system management</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Team oversight & analytics</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Advanced reporting tools</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>User & company management</span>
              </li>
            </ul>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
              <h3 className="font-semibold text-white text-sm sm:text-base">Sales Benefits</h3>
            </div>
            <ul className="text-slate-300 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Task management & tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>GPS-enabled check-ins</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Visit reporting tools</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Performance insights</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
