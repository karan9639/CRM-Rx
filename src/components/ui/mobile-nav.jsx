"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X, Menu, ChevronRight } from "lucide-react"

export function MobileNav({ items = [], isOpen, onToggle, className = "", title = "Navigation", subtitle = "" }) {
  const [expandedItems, setExpandedItems] = useState(new Set())

  // Close nav when route changes
  useEffect(() => {
    if (isOpen) {
      const handleRouteChange = () => onToggle(false)
      window.addEventListener("popstate", handleRouteChange)
      return () => window.removeEventListener("popstate", handleRouteChange)
    }
  }, [isOpen, onToggle])

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id || item.to)
    const paddingLeft = `${1 + level * 0.5}rem`

    if (hasChildren) {
      return (
        <div key={item.id || item.to} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.id || item.to)}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 group touch-feedback",
              "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent",
              level > 0 && "ml-4",
            )}
            style={{ paddingLeft }}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
              <span className="truncate">{item.label}</span>
            </div>
            <ChevronRight className={cn("h-4 w-4 transition-transform flex-shrink-0", isExpanded && "rotate-90")} />
          </button>

          {isExpanded && (
            <div className="space-y-1 mobile-slide-up">
              {item.children.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={() => onToggle(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group w-full touch-feedback",
            isActive
              ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent",
            level > 0 && "ml-4",
          )
        }
        style={{ paddingLeft }}
      >
        {item.icon && <item.icon className="h-5 w-5 flex-shrink-0 group-hover:text-purple-400" />}
        <span className="truncate">{item.label}</span>
        {item.badge && (
          <span className="ml-auto bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full flex-shrink-0">
            {item.badge}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden mobile-nav-overlay"
          onClick={() => onToggle(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 lg:hidden mobile-nav-slide",
          isOpen && "open",
          className,
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 safe-area-inset-top">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white truncate">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 flex-shrink-0 touch-target"
              onClick={() => onToggle(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto mobile-scroll p-4 space-y-2">
            {items.map((item) => renderNavItem(item))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50 safe-area-inset-bottom">
            <div className="text-xs text-slate-500 text-center">Swipe left or tap outside to close</div>
          </div>
        </div>
      </nav>
    </>
  )
}

// Mobile Navigation Toggle Button
export function MobileNavToggle({ isOpen, onToggle, className = "" }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "lg:hidden text-slate-300 hover:text-white hover:bg-slate-800/50 touch-target focus-enhanced",
        className,
      )}
      onClick={() => onToggle(!isOpen)}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
