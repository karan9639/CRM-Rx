/**
 * GPS and Geolocation utilities
 */

/**
 * Get current GPS position
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} GPS coordinates with accuracy
 */
export function getCurrentPosition(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options,
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        let errorMessage = "Unknown GPS error"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "GPS access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS position unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "GPS request timed out"
            break
        }
        reject(new Error(errorMessage))
      },
      defaultOptions,
    )
  })
}

/**
 * Watch GPS position changes
 * @param {Function} callback - Called with position updates
 * @param {Function} errorCallback - Called on errors
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing
 */
export function watchPosition(callback, errorCallback, options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options,
  }

  if (!navigator.geolocation) {
    errorCallback(new Error("Geolocation is not supported"))
    return null
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      })
    },
    (error) => {
      let errorMessage = "Unknown GPS error"
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "GPS access denied"
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "GPS position unavailable"
          break
        case error.TIMEOUT:
          errorMessage = "GPS request timed out"
          break
      }
      errorCallback(new Error(errorMessage))
    },
    defaultOptions,
  )
}

/**
 * Clear GPS position watch
 * @param {number} watchId - Watch ID to clear
 */
export function clearWatch(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Calculate distance between two GPS coordinates (in meters)
 * @param {Object} pos1 - First position {lat, lng}
 * @param {Object} pos2 - Second position {lat, lng}
 * @returns {number} Distance in meters
 */
export function calculateDistance(pos1, pos2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180
  const φ2 = (pos2.lat * Math.PI) / 180
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Format GPS coordinates for display
 * @param {Object} position - GPS position {lat, lng, accuracy}
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(position) {
  if (!position || !position.lat || !position.lng) {
    return "No GPS data"
  }

  const lat = position.lat.toFixed(6)
  const lng = position.lng.toFixed(6)
  const accuracy = position.accuracy ? `±${Math.round(position.accuracy)}m` : ""

  return `${lat}, ${lng} ${accuracy}`.trim()
}

/**
 * Generate Google Maps URL for directions
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @param {Object} origin - Origin coordinates {lat, lng} (optional)
 * @returns {string} Google Maps URL
 */
export function getDirectionsUrl(destination, origin = null) {
  const baseUrl = "https://www.google.com/maps/dir/"

  if (origin) {
    return `${baseUrl}${origin.lat},${origin.lng}/${destination.lat},${destination.lng}`
  }

  return `${baseUrl}/${destination.lat},${destination.lng}`
}

/**
 * Check if GPS is supported
 * @returns {boolean} True if GPS is supported
 */
export function isGPSSupported() {
  return "geolocation" in navigator
}
