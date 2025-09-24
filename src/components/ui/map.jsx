"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, AlertCircle } from "lucide-react"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { formatCoordinates } from "@/services/geolocation"

/**
 * Simple map component with fallback to coordinates display
 * Uses Leaflet if available, otherwise shows coordinates
 */
export default function Map({ positions = [], center, zoom = 13, height = "300px", className = "" }) {
  const mapRef = useRef(null)
  const [mapError, setMapError] = useState(false)
  const [leafletMap, setLeafletMap] = useState(null)
  const mapInitialized = useRef(false)

  // Try to load Leaflet and create map
  useEffect(() => {
    let map = null

    const initializeMap = async () => {
      try {
        if (mapInitialized.current || !mapRef.current) {
          return
        }

        // Dynamically import Leaflet
        const L = await import("leaflet")
        await import("leaflet/dist/leaflet.css")

        // Fix default markers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        if (mapRef.current._leaflet_id) {
          return
        }

        // Create map
        map = L.map(mapRef.current).setView(
          center ? [center.lat, center.lng] : [28.6139, 77.209], // Default to Delhi
          zoom,
        )

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add markers for positions
        positions.forEach((position, index) => {
          if (position.lat && position.lng) {
            const marker = L.marker([position.lat, position.lng]).addTo(map)

            if (position.title) {
              marker.bindPopup(position.title)
            }

            if (position.description) {
              marker.bindTooltip(position.description)
            }
          }
        })

        // If we have positions, fit bounds
        if (positions.length > 0) {
          const validPositions = positions.filter((p) => p.lat && p.lng)
          if (validPositions.length > 0) {
            const group = new L.featureGroup(validPositions.map((p) => L.marker([p.lat, p.lng])))
            map.fitBounds(group.getBounds().pad(0.1))
          }
        }

        setLeafletMap(map)
        mapInitialized.current = true
      } catch (error) {
        console.error("Failed to load map:", error)
        setMapError(true)
      }
    }

    initializeMap()

    return () => {
      if (map) {
        map.remove()
        mapInitialized.current = false
      }
    }
  }, [center, zoom, positions])

  // If map failed to load or no positions, show fallback
  if (mapError || positions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {positions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No GPS data available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground mb-3">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Map unavailable - showing coordinates</span>
              </div>
              {positions.map((position, index) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      {position.title && <div className="font-medium text-sm mb-1">{position.title}</div>}
                      <div className="text-sm text-muted-foreground">{formatCoordinates(position)}</div>
                      {position.description && (
                        <div className="text-xs text-muted-foreground mt-1">{position.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      GPS
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-lg overflow-hidden" />
      </CardContent>
    </Card>
  )
}
