"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, RefreshCcw, Loader2 } from "lucide-react"
import type { Trip, Activity, ChatMessage as SupabaseChatMessage } from "@/lib/supabase"
import { parseFullAIResponse } from "@/lib/activity-parser" // Use the new parser
import { geocodingAgent } from "@/lib/geocoding-agent"
import Markdown from "react-markdown"

interface ChatViewProps {
  trip: Trip
  initialMessagesFromDB: SupabaseChatMessage[]
  onNewMessageToServer: (messageData: Omit<SupabaseChatMessage, "id" | "trip_id" | "created_at">) => Promise<void>
  onNewActivitySuggestion: (
    activityData: Omit<Activity, "id" | "trip_id" | "created_at" | "updated_at">,
  ) => Promise<void>
}

export function ChatView({
  trip,
  initialMessagesFromDB,
  onNewMessageToServer,
  onNewActivitySuggestion,
}: ChatViewProps) {
  const [isProcessingActivities, setIsProcessingActivities] = useState(false)

  // Calculate trip duration and dates
  const tripStartDate = new Date(trip.from_date)
  const tripEndDate = new Date(trip.to_date)
  const tripDuration = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Ensure tripDetailsForAI matches what the API route expects for its prompt generation
  const [tripDetailsForAI] = useState({
    destination: trip.destination,
    duration:
      Math.ceil((new Date(trip.to_date).getTime() - new Date(trip.from_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    startDate: trip.from_date, // YYYY-MM-DD
    endDate: trip.to_date, // YYYY-MM-DD
    budget: `${trip.currency} ${trip.budget.toLocaleString()}`,
    interests: trip.interests,
    numPeople: trip.num_people,
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, reload } = useChat({
    api: "/api/chat/trip-plan",
    body: { tripDetails: tripDetailsForAI }, // Pass the correct tripDetails
    initialMessages: initialMessagesFromDB.map((dbMsg) => ({
      id: dbMsg.id,
      role: dbMsg.sender === "user" ? "user" : "assistant",
      content: dbMsg.content,
      createdAt: new Date(dbMsg.created_at),
    })),
    onFinish: async (message) => {
      console.log("ChatView: AI response finished:", message.content.substring(0, 100) + "...")

      // Save AI message to DB (if not already saved by initial call)
      // Check if this message ID already exists from initialMessagesFromDB to avoid duplicates
      const isExistingMessage = initialMessagesFromDB.some(
        (dbMsg) => dbMsg.content === message.content && dbMsg.sender === "ai",
      )
      if (!isExistingMessage) {
        await onNewMessageToServer({
          sender: "ai",
          content: message.content,
        })
      }
      await processActivitiesFromAIResponse(message.content)
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Effect to scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const processActivitiesFromAIResponse = async (content: string) => {
    setIsProcessingActivities(true)
    try {
      console.log("ChatView: Parsing full AI response...")
      const { dailyItinerary, overview, practicalInfo } = parseFullAIResponse(content, trip.currency)

      console.log("ChatView: Parsed Overview:", overview)
      console.log("ChatView: Parsed Daily Itinerary:", dailyItinerary)
      console.log("ChatView: Parsed Practical Info:", practicalInfo)

      // TODO: Store and display overview and practicalInfo sections in the UI.
      // For now, focus on activities.

      if (dailyItinerary.length === 0) {
        console.log("ChatView: No daily activities found in AI response.")
        setIsProcessingActivities(false)
        return
      }

      // Geocode all locations in parallel
      const locationsToGeocode = dailyItinerary.map((activity) => activity.location_name).filter(Boolean) as string[]

      console.log("ChatView: Geocoding locations:", locationsToGeocode)
      const geocodingResults = await geocodingAgent.geocodeMultipleLocations(locationsToGeocode, trip.destination)

      let geocodingIndex = 0
      for (const activity of dailyItinerary) {
        let geocodingResult = null
        if (activity.location_name) {
          geocodingResult = geocodingResults[geocodingIndex++]
        }

        const activityToSave: Omit<Activity, "id" | "trip_id" | "created_at" | "updated_at"> = {
          day_number: activity.day_number,
          start_time: activity.start_time || null,
          end_time: activity.end_time || null,
          title: activity.title,
          description: activity.description || null,
          location_name: geocodingResult?.formatted_address || activity.location_name || null,
          latitude: geocodingResult?.latitude || null,
          longitude: geocodingResult?.longitude || null,
          cost: activity.cost || null,
          currency: activity.currency || trip.currency,
          category: activity.category || null,
          order: activity.order,
        }

        console.log("ChatView: Saving activity:", activityToSave.title)
        await onNewActivitySuggestion(activityToSave)
      }
      console.log(`ChatView: Successfully processed ${dailyItinerary.length} activities.`)
    } catch (error) {
      console.error("ChatView: Error processing activities from AI response:", error)
    } finally {
      setIsProcessingActivities(false)
    }
  }

  // Handle form submission for user messages
  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessageContent = input

    // Save user message to DB
    await onNewMessageToServer({
      sender: "user",
      content: userMessageContent,
    })

    // Call useChat's handleSubmit to send to AI
    // Pass tripDetailsForAI in the options for the current turn
    handleSubmit(e, { options: { body: { tripDetails: tripDetailsForAI } } })
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-white">
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {messages.map((m, index) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end max-w-lg ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {m.role === "assistant" && (
                <Avatar className="h-8 w-8 mr-2 self-start">
                  <AvatarImage src="/placeholder.svg?width=32&height=32&text=AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`p-3 rounded-xl ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <Markdown
                  components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="font-semibold text-lg mb-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  }}
                >
                  {m.content}
                </Markdown>
                {m.role === "assistant" && !isLoading && index === messages.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reload()}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCcw className="mr-1 h-3 w-3" /> Regenerate
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading states */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="flex justify-start">
            <div className="flex items-end">
              <Avatar className="h-8 w-8 mr-2 self-start">
                <AvatarImage src="/placeholder.svg?width=32&height=32&text=AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-gray-100 text-gray-500 rounded-bl-none">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          </div>
        )}

        {isProcessingActivities && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing activities and updating map...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleUserSubmit} className="flex items-center space-x-2 border-t pt-4">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask AI to plan your trip..."
          className="flex-grow focus-visible:ring-primary"
          disabled={isLoading || isProcessingActivities}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-primary hover:bg-primary/90"
          disabled={isLoading || isProcessingActivities}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
