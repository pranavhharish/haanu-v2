import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Trip = {
  id: string
  user_id: string
  name: string
  destination: string
  num_people: number
  budget: number
  currency: string
  from_date: string
  to_date: string
  interests: string[]
  custom_interests: string[]
  status: "planning" | "confirmed" | "completed"
  created_at: string
  updated_at: string
}

export type TripExpense = {
  id: string
  trip_id: string
  category: string
  description: string
  amount: number
  currency: string
  expense_date: string
  created_at: string
}

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  default_currency: string
  date_format: string
  language: string
  email_notifications: boolean
  push_notifications: boolean
  trip_reminders: boolean
  budget_alerts: boolean
  public_profile: boolean
  share_trips: boolean
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  trip_id: string
  day_number: number
  start_time?: string | null // Format: HH:MM:SS
  end_time?: string | null // Format: HH:MM:SS
  title: string
  description?: string | null
  location_name?: string | null
  latitude?: number | null
  longitude?: number | null
  cost?: number | null
  currency?: string | null
  category?: string | null // e.g., 'dining', 'sightseeing', 'transport', 'accommodation', 'experience'
  order: number
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  trip_id: string
  sender: "user" | "ai"
  content: string
  created_at: string
  metadata?: Record<string, any> | null
}