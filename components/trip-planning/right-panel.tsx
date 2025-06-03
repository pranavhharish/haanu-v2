"use client"
import { MapView } from "./map-view"
import { DayCardsView } from "./day-cards-view"
import type { Trip, Activity } from "@/lib/supabase"

interface RightPanelProps {
  trip: Trip
  activities: Activity[]
}

export function RightPanel({ trip, activities }: RightPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[60%] border-b border-gray-200">
        <MapView trip={trip} activities={activities} />
      </div>
      <div className="h-[40%] overflow-y-auto">
        <DayCardsView trip={trip} activities={activities} />
      </div>
    </div>
  )
}
