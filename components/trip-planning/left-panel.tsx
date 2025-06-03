"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, CalendarDays, Loader2 } from "lucide-react"
import { ChatView } from "./chat-view"
import { ItineraryView } from "./itinerary-view"
import type { Trip, Activity, ChatMessage } from "@/lib/supabase"

interface LeftPanelProps {
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

type ActiveView = "chat" | "itinerary"

export function LeftPanel({
  trip,
  activities,
  chatMessages,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddChatMessage,
  onReorderActivities,
  isGeneratingItinerary = false,
}: LeftPanelProps) {
  const [activeView, setActiveView] = useState<ActiveView>("chat")

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeView === "chat" ? "AI Trip Planner" : "Trip Itinerary"}
            </h2>
            {isGeneratingItinerary && (
              <div className="flex items-center space-x-1 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView(activeView === "chat" ? "itinerary" : "chat")}
            className="text-sm"
            disabled={isGeneratingItinerary}
          >
            {activeView === "chat" ? (
              <>
                <CalendarDays className="mr-2 h-4 w-4" />
                View Itinerary
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Chat
              </>
            )}
          </Button>
        </div>

        {/* Activity count and status */}
        <div className="mt-2 text-sm text-gray-600">
          {activities.length > 0 ? (
            <span>
              {activities.length} activities planned across {Math.max(...activities.map((a) => a.day_number))} days
            </span>
          ) : (
            <span>No activities planned yet</span>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        {activeView === "chat" ? (
          <ChatView
            trip={trip}
            initialMessagesFromDB={chatMessages}
            onNewMessageToServer={onAddChatMessage}
            onNewActivitySuggestion={onAddActivity}
            isGeneratingItinerary={isGeneratingItinerary}
          />
        ) : (
          <ItineraryView
            trip={trip}
            activities={activities}
            onUpdateActivity={onUpdateActivity}
            onDeleteActivity={onDeleteActivity}
            onReorderActivities={onReorderActivities}
            onAddActivity={onAddActivity}
          />
        )}
      </div>
    </div>
  )
}
