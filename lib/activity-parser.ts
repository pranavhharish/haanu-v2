export interface ParsedActivity {
  day_number: number
  date_for_day?: string // New: To store the date string from "DAY X - Date"
  start_time?: string // Format: HH:MM:SS
  end_time?: string // Format: HH:MM:SS
  title: string
  description?: string
  location_name?: string
  cost?: number
  currency?: string
  category?: string
  order: number
  raw_text?: string // For debugging
}

export interface ParsedTripOverview {
  welcomeMessage?: string
  bestTimeToVisit?: string
  culturalTips?: string
  currencyGuidelines?: string
}

export interface ParsedPracticalInfo {
  accommodationSuggestions?: string
  localTransportation?: string
  mustTryFood?: string
  shoppingRecommendations?: string
  emergencyContacts?: string
  usefulPhrases?: string
  packingSuggestions?: string
}

export interface ParsedAIData {
  overview: ParsedTripOverview
  dailyItinerary: ParsedActivity[]
  practicalInfo: ParsedPracticalInfo
}

export const parseFullAIResponse = (content: string, tripDefaultCurrency = "USD"): ParsedAIData => {
  const overview = parseTripOverview(content)
  const dailyItinerary = parseDailyItinerary(content, tripDefaultCurrency)
  const practicalInfo = parsePracticalInformation(content)

  return { overview, dailyItinerary, practicalInfo }
}

const parseTripOverview = (content: string): ParsedTripOverview => {
  const overview: ParsedTripOverview = {}
  const overviewMatch = content.match(/Trip Overview:([\s\S]*?)Daily Itinerary:/i)
  if (overviewMatch && overviewMatch[1]) {
    const overviewText = overviewMatch[1]
    overview.welcomeMessage = extractSection(overviewText, /Welcome message.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    overview.bestTimeToVisit = extractSection(overviewText, /Best time to visit.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    overview.culturalTips = extractSection(overviewText, /Cultural tips.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    overview.currencyGuidelines = extractSection(overviewText, /Currency.*guidelines:([\s\S]*?)(?:\*|\n\n|$)/i)
  }
  return overview
}

const parsePracticalInformation = (content: string): ParsedPracticalInfo => {
  const practicalInfo: ParsedPracticalInfo = {}
  const practicalInfoMatch = content.match(/Practical Information:([\s\S]*)/i)
  if (practicalInfoMatch && practicalInfoMatch[1]) {
    const practicalText = practicalInfoMatch[1]
    practicalInfo.accommodationSuggestions = extractSection(
      practicalText,
      /Accommodation suggestions.*?:([\s\S]*?)(?:\*|\n\n|$)/i,
    )
    practicalInfo.localTransportation = extractSection(
      practicalText,
      /Local transportation options.*?:([\s\S]*?)(?:\*|\n\n|$)/i,
    )
    practicalInfo.mustTryFood = extractSection(practicalText, /Must-try local foods.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    practicalInfo.shoppingRecommendations = extractSection(
      practicalText,
      /Shopping recommendations.*?:([\s\S]*?)(?:\*|\n\n|$)/i,
    )
    practicalInfo.emergencyContacts = extractSection(practicalText, /Emergency contacts.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    practicalInfo.usefulPhrases = extractSection(practicalText, /Useful local phrases.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
    practicalInfo.packingSuggestions = extractSection(practicalText, /Packing suggestions.*?:([\s\S]*?)(?:\*|\n\n|$)/i)
  }
  return practicalInfo
}

const extractSection = (text: string, regex: RegExp): string | undefined => {
  const match = text.match(regex)
  return match && match[1] ? match[1].replace(/^\s*\*\s*/gm, "").trim() : undefined
}

const parseDailyItinerary = (content: string, tripDefaultCurrency: string): ParsedActivity[] => {
  const activities: ParsedActivity[] = []
  const dayBlocks = content.split(/DAY\s+(\d+)\s*-\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/gi)

  let currentDayNumber = 0
  let currentDateForDay = ""

  for (let i = 1; i < dayBlocks.length; i += 3) {
    currentDayNumber = Number.parseInt(dayBlocks[i])
    currentDateForDay = dayBlocks[i + 1]?.trim() || ""
    const dayContent = dayBlocks[i + 2] || ""

    if (!currentDayNumber || !dayContent) continue

    // Regex for: [TIME] Activity Name at Location ($Cost) - Description
    const activityRegex =
      /\[([^\]]+?)\]\s*(.+?)\s+at\s+(.+?)(?:\s+$$([^)]+?)$$)?\s*-\s*([\s\S]*?)(?=\n\[|DAY\s+\d+\s*-|\n\n|Practical Information:|$)/gi

    let match
    let orderInDay = 0
    while ((match = activityRegex.exec(dayContent)) !== null) {
      const timeStr = match[1]?.trim()
      const title = match[2]?.trim()
      const locationName = match[3]
        ?.trim()
        .replace(/$$\$.*?$$/, "")
        .trim() // Remove cost if it bleeds here
      const costStr = match[4]?.trim()
      const description = match[5]?.trim()

      const { startTime, endTime } = parseTimeString(timeStr)
      const { cost, currency } = parseCostString(costStr, tripDefaultCurrency)
      const category = inferCategory(title, description)

      activities.push({
        day_number: currentDayNumber,
        date_for_day: currentDateForDay,
        start_time: startTime,
        end_time: endTime,
        title,
        location_name: locationName,
        cost,
        currency,
        description,
        category,
        order: orderInDay++,
        raw_text: match[0], // For debugging
      })
    }
  }
  return activities
}

const parseTimeString = (timeStr?: string): { startTime?: string; endTime?: string } => {
  if (!timeStr) return {}

  const timeRangeMatch = timeStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
  if (timeRangeMatch) {
    return {
      startTime: formatSingleTime(timeRangeMatch[1]),
      endTime: formatSingleTime(timeRangeMatch[2]),
    }
  }

  const singleTime = formatSingleTime(timeStr)
  if (singleTime) return { startTime: singleTime }

  // Handle relative times like "Morning", "Afternoon", "Evening"
  const lowerTime = timeStr.toLowerCase()
  if (lowerTime.includes("morning")) return { startTime: "09:00:00" }
  if (lowerTime.includes("afternoon")) return { startTime: "14:00:00" }
  if (lowerTime.includes("evening")) return { startTime: "18:00:00" }

  return {}
}

const formatSingleTime = (timeStr: string): string | undefined => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return undefined

  let hour = Number.parseInt(match[1])
  const minute = match[2]
  const period = match[3]?.toUpperCase()

  if (period === "PM" && hour !== 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0 // Midnight case

  return `${hour.toString().padStart(2, "0")}:${minute}:00`
}

const parseCostString = (costStr?: string, defaultCurrency = "USD"): { cost?: number; currency: string } => {
  if (!costStr || costStr.toLowerCase() === "free" || costStr.toLowerCase() === "$0") {
    return { cost: 0, currency: defaultCurrency }
  }

  // Regex to capture amount and optional currency symbol/code
  // Supports: $25, 25 USD, Rp 150.000, 150.000 Rp, €20, 20EUR
  const costMatch = costStr.match(/(?:([$€£¥₹])\s*([\d,.]+)|([\d,.]+)\s*([$€£¥₹A-Z]{2,3}))/i)

  let amount: number | undefined
  let currencySymbolOrCode: string | undefined

  if (costMatch) {
    if (costMatch[1] && costMatch[2]) {
      // Symbol first: $25
      currencySymbolOrCode = costMatch[1]
      amount = Number.parseFloat(costMatch[2].replace(/,/g, ""))
    } else if (costMatch[3] && costMatch[4]) {
      // Amount first: 25 USD
      amount = Number.parseFloat(costMatch[3].replace(/,/g, ""))
      currencySymbolOrCode = costMatch[4]
    }
  } else {
    // Try to parse if it's just a number
    const justNumberMatch = costStr.match(/([\d,.]+)/)
    if (justNumberMatch) {
      amount = Number.parseFloat(justNumberMatch[1].replace(/,/g, ""))
    }
  }

  if (typeof amount !== "number" || isNaN(amount)) {
    return { currency: defaultCurrency } // Cannot parse amount
  }

  const currencyMap: { [key: string]: string } = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    JPY: "JPY",
    INR: "INR",
    RP: "IDR",
    IDR: "IDR",
  }

  const finalCurrency = currencySymbolOrCode
    ? currencyMap[currencySymbolOrCode.toUpperCase()] || defaultCurrency
    : defaultCurrency

  return { cost: amount, currency: finalCurrency }
}

const inferCategory = (title: string, description?: string): string => {
  const text = `${title} ${description || ""}`.toLowerCase()
  const categoryKeywords: { [key: string]: string[] } = {
    dining: [
      "restaurant",
      "cafe",
      "food",
      "eat",
      "lunch",
      "dinner",
      "breakfast",
      "meal",
      "warung",
      "bistro",
      "cuisine",
      "tasting",
    ],
    sightseeing: [
      "temple",
      "museum",
      "palace",
      "monument",
      "view",
      "landmark",
      "heritage",
      "cultural",
      "historic",
      "site",
      "gallery",
      "cathedral",
      "church",
      "mosque",
    ],
    activity: [
      "tour",
      "adventure",
      "experience",
      "sport",
      "trek",
      "dive",
      "surf",
      "climb",
      "hike",
      "class",
      "workshop",
      "show",
      "performance",
      "park",
      "garden",
      "beach",
    ],
    transport: ["airport", "flight", "transfer", "taxi", "bus", "train", "transport", "ferry", "scooter", "car rental"],
    accommodation: ["hotel", "check-in", "check out", "accommodation", "lodge", "resort", "stay", "hostel", "villa"],
    shopping: ["shop", "market", "mall", "souvenir", "boutique"],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }
  return "activity" // Default category
}

// This function might be less critical if AI adheres to DAY X distribution
export const distributeActivitiesAcrossDays = (activities: ParsedActivity[], totalDays: number): ParsedActivity[] => {
  // If AI provides day_number for all, this function might just validate or slightly adjust.
  // For now, assume AI does a decent job with the new prompt.
  // A more complex version would re-balance if one day is too crowded.
  return activities.map((act, index) => ({
    ...act,
    day_number: act.day_number || (index % totalDays) + 1, // Simple fallback if day_number is missing
    order: act.order || index, // Ensure order is set
  }))
}
