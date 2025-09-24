"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = { id, ...toast }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 5000)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options) => {
      if (typeof options === "string") {
        return addToast({ title: options, type: "info" })
      }
      return addToast(options)
    },
    [addToast],
  )

  toast.success = useCallback(
    (title, description) => {
      return addToast({ title, description, type: "success" })
    },
    [addToast],
  )

  toast.error = useCallback(
    (title, description) => {
      return addToast({ title, description, type: "error" })
    },
    [addToast],
  )

  toast.warning = useCallback(
    (title, description) => {
      return addToast({ title, description, type: "warning" })
    },
    [addToast],
  )

  toast.info = useCallback(
    (title, description) => {
      return addToast({ title, description, type: "info" })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
  }

  const Icon = icons[toast.type] || Info

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-80 max-w-md ${colors[toast.type]}`}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && <div className="text-sm opacity-90 mt-1">{toast.description}</div>}
      </div>
      <button onClick={onRemove} className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
