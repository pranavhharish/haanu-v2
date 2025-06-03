import { openai } from "@ai-sdk/openai"
import { streamText, type Message } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, tripDetails }: { messages: Message[]; tripDetails: any } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required and must not be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!tripDetails) {
      return new Response(JSON.stringify({ error: "Trip details are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("API: Received messages:", messages.length, "messages")
    console.log("API: Trip details for prompt:", tripDetails)

    const {
      destination = "Not specified",
      duration = 7, // Default duration if not provided
      startDate = new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"),
      budget = "Not specified",
      interests = [],
      numPeople = 1,
      // travelStyle is not in current tripDetails, using interests as a proxy
    } = tripDetails

    const interestsString = Array.isArray(interests) ? interests.join(", ") : "General sightseeing"

    // Generate date strings for each day for the prompt
    const tripDates: string[] = []
    const currentStartDate = new Date(startDate)
    for (let i = 0; i < duration; i++) {
      const date = new Date(currentStartDate)
      date.setDate(currentStartDate.getDate() + i)
      tripDates.push(
        date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      )
    }

    const systemMessage = `You are an expert travel planner creating personalized itineraries. Based on the trip details provided, create a comprehensive day-by-day itinerary.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${duration} days
- Start Date: ${tripDates[0] || "Not specified"}
- End Date: ${tripDates[tripDates.length - 1] || "Not specified"}
- Budget: ${budget}
- Interests: ${interestsString}
- Number of Travelers: ${numPeople}

ITINERARY REQUIREMENTS:

Trip Overview (Include this section at the beginning):
* Welcome message with ${destination} highlights.
* Best time to visit ${destination}.
* Key cultural tips and local customs for ${destination}.
* Currency used in ${destination} and general tipping guidelines.

Daily Itinerary (Day-by-Day for ALL ${duration} days):
Format each day strictly as: DAY [DayNumber] - [Date in Month DD, YYYY format, e.g., March 15, 2024]
Example for one activity:
[9:00 AM] Activity Name at Specific Full Address, City ($Cost in local currency or USD if appropriate) - Brief, engaging description.
* Morning activities (approx. 9 AM - 12 PM)
* Afternoon activities (approx. 12 PM - 5 PM)
* Evening activities (approx. 5 PM - 9 PM)
* Include restaurant recommendations for each meal (breakfast, lunch, dinner) with names and general locations.
* Briefly mention transportation considerations between major activities (e.g., "Take a taxi to...", "Short walk to...").
* Provide estimated costs for activities in parentheses, e.g., ($25 USD) or (Rp 150,000).
* Allocate realistic time for each activity.

Practical Information (Include this section at the end):
* Accommodation suggestions by area/neighborhood in ${destination} (e.g., "Seminyak for luxury, Ubud for culture").
* Local transportation options in ${destination} (e.g., "Grab, Gojek, local taxis, scooter rental").
* Must-try local foods and drinks in ${destination}.
* Shopping recommendations (markets, malls, souvenirs).
* Emergency contacts (e.g., general emergency number for ${destination}).
* A few useful local phrases.
* Packing suggestions specific to ${destination} and the season of travel.

CRITICAL FORMATTING & CONTENT RULES:
1.  Address ALL ${duration} days of the trip.
2.  Each day must start with "DAY [Number] - [Date]".
3.  Activity lines must start with "[TIME]" (e.g., "[10:00 AM]").
4.  Follow activity with "at [Full Location/Address]".
5.  Include cost in parentheses "($Cost)". If free, use "($0)" or "(Free)".
6.  Provide a concise description after a hyphen "-".
7.  Ensure locations are specific enough for geocoding (full addresses or well-known landmarks).
8.  Distribute activities logically. Don't cram too much into one day. Aim for 3-5 main activities/meals per day.
9.  Use emojis sparingly for visual appeal in section headers or key points.
10. Respond in clear, scannable sections. Use bullet points for lists within Trip Overview and Practical Information.

Your goal is to provide a detailed, actionable, and inspiring itinerary that the user can immediately start using for their trip planning.
Make the AI response conversational, detailed, and actionable. Ensure all map pins are accurately plotted and the interface is intuitive for trip planning workflow.
`

    const result = await streamText({
      model: openai("gpt-4o-mini"), // Consider gpt-4o for better quality with complex prompts
      system: systemMessage,
      messages: messages,
      temperature: 0.7, // Adjust for creativity vs. precision
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("[API /api/chat/trip-plan ERROR]", error)
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
