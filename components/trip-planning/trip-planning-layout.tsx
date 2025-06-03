"use client"

import { LeftPanel } from "./left-panel"
import { RightPanel } from "./right-panel"
import type { Trip, Activity, ChatMessage } from "@/lib/supabase"

interface TripPlanningLayoutProps {
  trip: Trip
  activities: Activity[]
  chatMessages: ChatMessage[]
  onAddActivity: (activityData: Omit<Activity, "id" | "trip_id" | "created_at" | "updated_at">) => Promise<void>
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>
  onDeleteActivity: (activityId: string) => Promise<void>
  onAddChatMessage: (messageData: Omit<ChatMessage, "id" | "trip_id" | "created_at">) => Promise<void>
  onReorderActivities: (dayNumber: number, reorderedActivityIds: string[]) => Promise<void>
  isGeneratingItinerary?: boolean
}

export function TripPlanningLayout({
  trip,
  activities,
  chatMessages,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddChatMessage,
  onReorderActivities,
  isGeneratingItinerary = false,
}: TripPlanningLayoutProps) {
  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/2 border-r border-gray-200 h-full overflow-hidden">
        <LeftPanel
          trip={trip}
          activities={activities}
          chatMessages={chatMessages}
          onAddActivity={onAddActivity}
          onAddChatMessage={onAddChatMessage}
          onUpdateActivity={onUpdateActivity}
          onDeleteActivity={onDeleteActivity}
          onReorderActivities={onReorderActivities}
          isGeneratingItinerary={isGeneratingItinerary}
        />
      </div>
      <div className="w-1/2 h-full overflow-hidden">
        <RightPanel trip={trip} activities={activities} />
      </div>
    </div>
  )
}
