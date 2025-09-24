import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

/**
 * Format date to readable string
 * @param {string} date - ISO date string
 * @param {string} format - dayjs format string
 * @returns {string}
 */
export function formatDate(date, format = "MMM DD, YYYY") {
  return dayjs(date).format(format)
}

/**
 * Format date to time string
 * @param {string} date - ISO date string
 * @returns {string}
 */
export function formatTime(date) {
  return dayjs(date).format("HH:mm")
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string} date - ISO date string
 * @returns {string}
 */
export function formatRelativeTime(date) {
  return dayjs(date).fromNow()
}

/**
 * Check if date is today
 * @param {string} date - ISO date string
 * @returns {boolean}
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), "day")
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get status badge variant
 * @param {string} status
 * @returns {string}
 */
export function getStatusVariant(status) {
  switch (status) {
    case "completed":
      return "success"
    case "in_progress":
      return "warning"
    case "assigned":
      return "default"
    case "missed":
      return "destructive"
    default:
      return "outline"
  }
}

/**
 * Get status label
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  switch (status) {
    case "in_progress":
      return "In Progress"
    case "assigned":
      return "Assigned"
    case "completed":
      return "Completed"
    case "missed":
      return "Missed"
    default:
      return status
  }
}
