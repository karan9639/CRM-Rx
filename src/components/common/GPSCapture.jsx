"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { getCurrentPosition, formatCoordinates } from "@/services/geolocation"

/**
 * GPS Capture component for getting current location
 */
export default function GPSCapture({ onLocationCapture, autoCapture = false, className = "" }) {
  const [gpsState, setGpsState] = useState("idle") // idle, loading, success, error
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Auto-capture on mount if enabled
  useEffect(() => {
    if (autoCapture) {
      handleCaptureGPS()
    }
  }, [autoCapture])

  const handleCaptureGPS = async () => {
    setIsCapturing(true)
    setGpsState("loading")
    setError(null)

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      })

      setLocation(position)
      setGpsState("success")

      // Call parent callback
      if (onLocationCapture) {
        onLocationCapture(position)
      }
    } catch (err) {
      setError(err.message)
      setGpsState("error")
    } finally {
      setIsCapturing(false)
    }
  }

  const getStatusIcon = () => {
    switch (gpsState) {
      case "loading":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (gpsState) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "loading":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      default:
        return "bg-muted border-border"
    }
  }

  const getStatusText = () => {
    switch (gpsState) {
      case "loading":
        return "Capturing GPS location..."
      case "success":
        return "GPS location captured successfully"
      case "error":
        return `GPS Error: ${error}`
      default:
        return "GPS location not captured"
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className={`p-3 rounded-md border ${getStatusColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">GPS Location</span>
            </div>
            {gpsState === "success" && (
              <Badge variant="success" className="text-xs">
                Captured
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground mb-3">{getStatusText()}</div>

          {location && (
            <div className="space-y-2 mb-3">
              <div className="text-sm">
                <span className="font-medium">Coordinates: </span>
                <span className="font-mono">{formatCoordinates(location)}</span>
              </div>
              {location.accuracy && (
                <div className="text-xs text-muted-foreground">Accuracy: ±{Math.round(location.accuracy)} meters</div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant={gpsState === "success" ? "outline" : "default"}
              size="sm"
              onClick={handleCaptureGPS}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-3 w-3" />
                  {gpsState === "success" ? "Recapture GPS" : "Capture GPS"}
                </>
              )}
            </Button>

            {location && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`
                  window.open(url, "_blank")
                }}
              >
                View on Map
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
