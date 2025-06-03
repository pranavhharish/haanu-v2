"use client"

import { useState, useEffect } from "react"
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api"
import type { Trip, Activity } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface MapViewProps {
  trip: Trip
  activities: Activity[]
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = { lat: 0, lng: 0 }
const tokyoCenter = { lat: 35.6895, lng: 139.6917 }

export function MapView({ trip, activities }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState(tokyoCenter)
  const [zoom, setZoom] = useState(10)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [activeDayFilter, setActiveDayFilter] = useState<number | "all">("all")
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Define some colors for day-specific markers
  const dayColors = [
    "#FF5733", // Day 1 (Orange-Red)
    "#33FF57", // Day 2 (Green)
    "#3357FF", // Day 3 (Blue)
    "#FF33A1", // Day 4 (Pink)
    "#F3FF33", // Day 5 (Yellow)
    "#8333FF", // Day 6 (Purple)
    "#33FFF3", // Day 7 (Cyan)
  ]

  useEffect(() => {
    if (trip.destination) {
      if (trip.destination.toLowerCase().includes("tokyo")) {
        setMapCenter(tokyoCenter)
        setZoom(10)
      } else if (trip.destination.toLowerCase().includes("bali")) {
        setMapCenter({ lat: -8.3405, lng: 115.092 })
        setZoom(9)
      } else {
        const firstActivityWithCoords = activities.find((act) => act.latitude && act.longitude)
        if (firstActivityWithCoords) {
          setMapCenter({ lat: firstActivityWithCoords.latitude!, lng: firstActivityWithCoords.longitude! })
          setZoom(12)
        } else {
          setMapCenter(defaultCenter)
          setZoom(2)
        }
      }
    }
  }, [trip.destination, activities])

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-red-500">
        Google Maps API Key is missing.
      </div>
    )
  }

  const filteredActivities =
    activeDayFilter === "all" ? activities : activities.filter((act) => act.day_number === activeDayFilter)

  const uniqueDays = Array.from(new Set(activities.map((act) => act.day_number))).sort((a, b) => a - b)

  // Function to create marker icon - only called after Google Maps is loaded
  const createMarkerIcon = (dayNumber: number) => {
    if (!isGoogleMapsLoaded || !window.google?.maps) {
      return undefined // Return undefined if Google Maps isn't loaded yet
    }

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: dayColors[(dayNumber - 1) % dayColors.length],
      fillOpacity: 1,
      strokeColor: "white",
      strokeWeight: 2,
      scale: 8,
    }
  }

  const handleMapLoad = (map: google.maps.Map) => {
    setIsGoogleMapsLoaded(true)

    // Fit bounds to markers if activities exist
    if (activities.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      activities.forEach((act) => {
        if (act.latitude && act.longitude) {
          bounds.extend(new window.google.maps.LatLng(act.latitude, act.longitude))
        }
      })
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds)
        // Adjust zoom if only one marker or markers are too close
        const currentZoom = map.getZoom()
        if (currentZoom && currentZoom > 15) {
          map.setZoom(15)
        }
      }
    }
  }

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 left-2 z-10 flex space-x-2 bg-white p-1 rounded-md shadow">
        <Button
          size="sm"
          variant={activeDayFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveDayFilter("all")}
          className={`h-7 text-xs ${activeDayFilter === "all" ? "bg-primary text-primary-foreground" : ""}`}
        >
          All Days
        </Button>
        {uniqueDays.map((day) => (
          <Button
            key={day}
            size="sm"
            variant={activeDayFilter === day ? "default" : "outline"}
            onClick={() => setActiveDayFilter(day)}
            className={`h-7 text-xs ${activeDayFilter === day ? "bg-primary text-primary-foreground" : ""}`}
          >
            Day {day}
          </Button>
        ))}
      </div>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={zoom}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
          onLoad={handleMapLoad}
        >
          {isGoogleMapsLoaded &&
            filteredActivities.map((activity) =>
              activity.latitude && activity.longitude ? (
                <MarkerF
                  key={activity.id}
                  position={{ lat: activity.latitude, lng: activity.longitude }}
                  onClick={() => setSelectedActivity(activity)}
                  icon={createMarkerIcon(activity.day_number)}
                />
              ) : null,
            )}

          {selectedActivity && selectedActivity.latitude && selectedActivity.longitude && isGoogleMapsLoaded && (
            <InfoWindowF
              position={{ lat: selectedActivity.latitude, lng: selectedActivity.longitude }}
              onCloseClick={() => setSelectedActivity(null)}
              options={{
                pixelOffset: window.google?.maps ? new window.google.maps.Size(0, -30) : undefined,
              }}
            >
              <div className="p-1">
                <h4 className="font-semibold text-sm">{selectedActivity.title}</h4>
                <p className="text-xs text-gray-600">{selectedActivity.location_name}</p>
                {selectedActivity.start_time && (
                  <p className="text-xs text-gray-500">Time: {selectedActivity.start_time}</p>
                )}
                {selectedActivity.cost && (
                  <p className="text-xs text-gray-500">
                    Cost: {selectedActivity.currency} {selectedActivity.cost}
                  </p>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}
