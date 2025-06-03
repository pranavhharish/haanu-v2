"use client"

import { useState, useEffect, useCallback } from "react"
import { trips as tripsApi } from "@/lib/trips"
import type { Trip } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user first
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        setTrips([])
        setLoading(false)
        return
      }

      console.log("Fetching trips for user:", user.id)
      const { data, error: fetchError } = await tripsApi.getTrips()

      if (fetchError) {
        setError(fetchError.message)
        console.error("Error fetching trips:", fetchError)
      } else {
        console.log("Fetched trips:", data) // Debug log
        setTrips(data || [])
      }
    } catch (err) {
      setError("Failed to fetch trips")
      console.error("Error fetching trips:", err)
    } finally {
      // Ensure loading is set to false regardless of success or failure
      setLoading(false)
    }
  }, [])

  const createTrip = async (tripData: Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true)
      console.log("Creating trip with data:", tripData) // Debug log
      const { data, error: createError } = await tripsApi.createTrip(tripData)

      if (createError) {
        console.error("Create trip error:", createError) // Debug log
        throw new Error(createError.message)
      }

      if (data) {
        console.log("Trip created successfully:", data) // Debug log
        setTrips((prev) => [data, ...prev])
      }

      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to create trip"
      console.error("Create trip catch error:", error) // Debug log
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId: string) => {
    try {
      setLoading(true)
      const { error: deleteError } = await tripsApi.deleteTrip(tripId)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to delete trip"
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      setLoading(true)
      const { data, error: updateError } = await tripsApi.updateTrip(tripId, updates)

      if (updateError) {
        throw new Error(updateError.message)
      }

      if (data) {
        setTrips((prev) => prev.map((trip) => (trip.id === tripId ? data : trip)))
      }

      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to update trip"
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    deleteTrip,
    updateTrip,
    refetch: fetchTrips,
  }
}
