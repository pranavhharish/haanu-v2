"use client"

import type React from "react"
import type { Trip, Activity } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Landmark, ShoppingBag, Mountain, Palette, Clock } from "lucide-react" // Example icons

interface DayCardsViewProps {
  trip: Trip
  activities: Activity[]
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  dining: <Utensils className="h-4 w-4" />,
  sightseeing: <Landmark className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  adventure: <Mountain className="h-4 w-4" />,
  art: <Palette className="h-4 w-4" />,
  default: <Clock className="h-4 w-4" />,
}

export function DayCardsView({ trip, activities }: DayCardsViewProps) {
  // Group activities by day
  const activitiesByDay: { [key: number]: Activity[] } = {}
  activities.forEach((activity) => {
    if (!activitiesByDay[activity.day_number]) {
      activitiesByDay[activity.day_number] = []
    }
    activitiesByDay[activity.day_number].push(activity)
  })

  // Sort activities within each day by order, then start_time
  Object.keys(activitiesByDay).forEach((day) => {
    activitiesByDay[Number.parseInt(day)].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time)
      }
      return 0
    })
  })

  const tripStartDate = new Date(trip.from_date + "T00:00:00")

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 h-full flex flex-col justify-center items-center">
        <Clock className="h-10 w-10 mb-2 text-gray-400" />
        <p>No activities planned yet.</p>
        <p className="text-sm">Use the AI chat to generate some ideas!</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 bg-gray-100 h-full overflow-y-auto">
      {Object.entries(activitiesByDay)
        .sort(([dayA], [dayB]) => Number.parseInt(dayA) - Number.parseInt(dayB)) // Sort days numerically
        .map(([dayNumber, dayActivities]) => {
          const dayDate = new Date(tripStartDate)
          dayDate.setDate(tripStartDate.getDate() + Number.parseInt(dayNumber) - 1)

          return (
            <Card key={dayNumber} className="shadow-md">
              <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                <CardTitle className="text-md font-semibold flex justify-between items-center">
                  <span>Day {dayNumber}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {dayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dayActivities.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">No activities for this day.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {dayActivities.map((activity) => (
                      <li key={activity.id} className="p-3 hover:bg-orange-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 text-primary">
                            {categoryIcons[activity.category?.toLowerCase() || "default"] || categoryIcons.default}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                            {activity.start_time && (
                              <p className="text-xs text-gray-500">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {activity.start_time.substring(0, 5)}
                                {activity.end_time ? ` - ${activity.end_time.substring(0, 5)}` : ""}
                              </p>
                            )}
                            {activity.location_name && (
                              <p className="text-xs text-gray-500">{activity.location_name}</p>
                            )}
                            {activity.cost && (
                              <p className="text-xs text-gray-500">
                                Est. {activity.currency || "$"}
                                {activity.cost}
                              </p>
                            )}
                          </div>
                          {/* Quick actions can go here, e.g., edit, delete */}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}
