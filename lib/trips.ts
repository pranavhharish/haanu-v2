import { supabase } from "./supabase"
import type { Trip } from "./supabase"

export const trips = {
  // Get all trips for the current user
  getTrips: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: { message: "User not authenticated" } }
    }

    console.log("Querying trips for user ID:", user.id)

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    console.log("Trips query result:", { data, error, userId: user.id }) // Debug log

    if (error) {
      console.error("Supabase query error:", error)
    } else if (!data || data.length === 0) {
      console.log("No trips found for user")
    } else {
      console.log(`Found ${data.length} trips for user`)
    }

    return { data, error }
  },

  // Get a single trip by ID
  getTrip: async (id: string) => {
    const { data, error } = await supabase.from("trips").select("*").eq("id", id).single()

    return { data, error }
  },

  // Create a new trip
  createTrip: async (tripData: Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: { message: "User not authenticated" } }
    }

    console.log("Creating trip for user:", user.id)

    const { data, error } = await supabase
      .from("trips")
      .insert([
        {
          ...tripData,
          user_id: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Trip creation error:", error)
    } else {
      console.log("Trip created successfully:", data)
    }

    return { data, error }
  },

  // Update a trip
  updateTrip: async (id: string, updates: Partial<Trip>) => {
    const { data, error } = await supabase.from("trips").update(updates).eq("id", id).select().single()

    return { data, error }
  },

  // Delete a trip
  deleteTrip: async (id: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", id)

    return { error }
  },

  // Get trip expenses
  getTripExpenses: async (tripId: string) => {
    const { data, error } = await supabase
      .from("trip_expenses")
      .select("*")
      .eq("trip_id", tripId)
      .order("expense_date", { ascending: false })

    return { data, error }
  },

  // Add trip expense
  addTripExpense: async (expenseData: {
    trip_id: string
    category: string
    description?: string
    amount: number
    currency: string
    expense_date?: string
  }) => {
    const { data, error } = await supabase.from("trip_expenses").insert([expenseData]).select().single()

    return { data, error }
  },
}
