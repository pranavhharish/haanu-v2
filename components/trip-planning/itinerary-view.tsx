"use client"
import type { Trip, Activity } from "@/lib/supabase"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Download, CalendarDays, Edit2, Trash2, GripVertical } from "lucide-react" // Added icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // For better styling

interface ItineraryViewProps {
  trip: Trip
  activities: Activity[]
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>
  onDeleteActivity: (activityId: string) => Promise<void>
  onReorderActivities: (dayNumber: number, reorderedActivityIds: string[]) => Promise<void>
  onAddActivity: (activityData: Omit<Activity, "id" | "trip_id" | "created_at" | "updated_at">) => Promise<void>
}

export function ItineraryView({
  trip,
  activities,
  onUpdateActivity,
  onDeleteActivity,
  onReorderActivities,
  onAddActivity,
}: ItineraryViewProps) {
  const activitiesByDay: { [key: number]: Activity[] } = {}
  activities.forEach((activity) => {
    const day = activity.day_number || 1 // Default to day 1 if not set
    if (!activitiesByDay[day]) {
      activitiesByDay[day] = []
    }
    activitiesByDay[day].push(activity)
  })

  Object.keys(activitiesByDay).forEach((day) => {
    activitiesByDay[Number.parseInt(day)].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const tripStartDate = new Date(trip.from_date + "T00:00:00") // Ensure local timezone for date part

  // Placeholder for drag and drop, inline editing - these are complex features
  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    e.dataTransfer.setData("activityId", activityId)
  }
  const handleDrop = (e: React.DragEvent, dayNumber: number) => {
    const activityId = e.dataTransfer.getData("activityId")
    // Basic reorder logic: find activity, update its day_number and potentially order
    // This needs to be much more robust for actual reordering within/between days.
    const activityToMove = activities.find((act) => act.id === activityId)
    if (activityToMove) {
      const newOrder = activitiesByDay[dayNumber]?.length || 0 // Simplistic new order
      onUpdateActivity(activityId, { day_number: dayNumber, order: newOrder })
    }
    console.log(`Dropped activity ${activityId} onto day ${dayNumber}`)
  }
  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="p-4 h-full bg-white overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Itinerary for {trip.name}</h3>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {Object.keys(activitiesByDay).length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <CalendarDays className="h-12 w-12 mx-auto mb-2" />
          <p>Your itinerary is empty.</p>
          <p>Use the AI Chat to add activities or add them manually here.</p>
          {/* TODO: Add a button to manually add an activity */}
        </div>
      )}

      {Object.entries(activitiesByDay)
        .sort(([dayA], [dayB]) => Number.parseInt(dayA) - Number.parseInt(dayB))
        .map(([dayNumberStr, dayActivities]) => {
          const dayNumber = Number.parseInt(dayNumberStr)
          const dayDate = new Date(tripStartDate)
          dayDate.setDate(tripStartDate.getDate() + dayNumber - 1)

          return (
            <div key={dayNumber} className="mb-8" onDrop={(e) => handleDrop(e, dayNumber)} onDragOver={allowDrop}>
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                  <CardTitle className="text-md font-semibold flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        {dayNumber}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-800">Day {dayNumber}</h4>
                        <p className="text-xs text-gray-500">
                          {dayDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {/* Add button for new activity this day */}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {dayActivities.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No activities planned for this day.</p>
                  )}
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow flex items-start group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, activity.id)}
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 mr-2 mt-0.5 cursor-grab group-hover:text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-700">{activity.title}</p>
                        {activity.start_time && (
                          <p className="text-xs text-gray-500">
                            Time: {activity.start_time.substring(0, 5)}
                            {activity.end_time ? ` - ${activity.end_time.substring(0, 5)}` : ""}
                          </p>
                        )}
                        {activity.location_name && (
                          <p className="text-xs text-gray-500">Location: {activity.location_name}</p>
                        )}
                        {activity.description && <p className="text-xs text-gray-500 mt-1">{activity.description}</p>}
                        {activity.cost && (
                          <p className="text-xs text-gray-500">
                            Cost: {activity.currency || trip.currency} {activity.cost}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => console.log("Edit", activity.id) /* TODO: Implement edit */}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onDeleteActivity(activity.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )
        })}
    </div>
  )
}
