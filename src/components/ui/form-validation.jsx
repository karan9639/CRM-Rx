"use client"

import { useState } from "react"
import { useToast } from "./toast"

export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const validateField = (name, value) => {
    const rules = validationRules[name]
    if (!rules) return ""

    for (const rule of rules) {
      const error = rule(value, values)
      if (error) return error
    }
    return ""
  }

  const validateAll = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (onSubmit) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      if (!validateAll()) {
        toast.error("Please fix the errors below")
        return
      }

      await onSubmit(values)
      toast.success("Form submitted successfully")
    } catch (error) {
      toast.error(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  }
}

// Common validation rules
export const validationRules = {
  required: (value) => (!value || value.trim() === "" ? "This field is required" : ""),
  email: (value) => {
    if (!value) return ""
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? "Please enter a valid email address" : ""
  },
  phone: (value) => {
    if (!value) return ""
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return !phoneRegex.test(value.replace(/\s/g, "")) ? "Please enter a valid phone number" : ""
  },
  minLength: (min) => (value) => {
    if (!value) return ""
    return value.length < min ? `Must be at least ${min} characters` : ""
  },
  maxLength: (max) => (value) => {
    if (!value) return ""
    return value.length > max ? `Must be no more than ${max} characters` : ""
  },
  number: (value) => {
    if (!value) return ""
    return isNaN(value) ? "Must be a valid number" : ""
  },
  positiveNumber: (value) => {
    if (!value) return ""
    const num = Number.parseFloat(value)
    return isNaN(num) || num <= 0 ? "Must be a positive number" : ""
  },
}
