export interface GeocodingResult {
  latitude: number
  longitude: number
  formatted_address: string
  confidence: "high" | "medium" | "low"
}

export interface GeocodingCache {
  [key: string]: GeocodingResult
}

class GeocodingAgent {
  private cache: GeocodingCache = {}
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  }

  async geocodeLocation(locationName: string, destinationContext?: string): Promise<GeocodingResult | null> {
    // Check cache first
    const cacheKey = `${locationName}_${destinationContext}`.toLowerCase()
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey]
    }

    if (!this.apiKey) {
      console.warn("Google Maps API key not available for geocoding")
      return this.getFallbackCoordinates(destinationContext)
    }

    try {
      // Enhance query with destination context
      const query = destinationContext ? `${locationName}, ${destinationContext}` : locationName

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${this.apiKey}`,
      )

      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        const geocodingResult: GeocodingResult = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          confidence: this.assessConfidence(result, locationName),
        }

        // Cache the result
        this.cache[cacheKey] = geocodingResult
        return geocodingResult
      }

      // Fallback to destination center if specific location fails
      return this.getFallbackCoordinates(destinationContext)
    } catch (error) {
      console.error("Geocoding error:", error)
      return this.getFallbackCoordinates(destinationContext)
    }
  }

  async geocodeMultipleLocations(
    locations: string[],
    destinationContext?: string,
  ): Promise<(GeocodingResult | null)[]> {
    // Process in parallel with rate limiting
    const batchSize = 5
    const results: (GeocodingResult | null)[] = []

    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize)
      const batchPromises = batch.map((location) => this.geocodeLocation(location, destinationContext))

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Rate limiting delay
      if (i + batchSize < locations.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return results
  }

  private assessConfidence(result: any, originalQuery: string): "high" | "medium" | "low" {
    const types = result.types || []
    const formattedAddress = result.formatted_address.toLowerCase()
    const query = originalQuery.toLowerCase()

    // High confidence: exact match or specific place
    if (types.includes("establishment") || types.includes("point_of_interest")) {
      return "high"
    }

    // Medium confidence: street address or locality
    if (types.includes("street_address") || types.includes("route")) {
      return "medium"
    }

    // Low confidence: general area
    return "low"
  }

  private getFallbackCoordinates(destinationContext?: string): GeocodingResult | null {
    // Fallback coordinates for popular destinations
    const fallbackCoordinates: { [key: string]: { lat: number; lng: number } } = {
      tokyo: { lat: 35.6762, lng: 139.6503 },
      bali: { lat: -8.3405, lng: 115.092 },
      paris: { lat: 48.8566, lng: 2.3522 },
      london: { lat: 51.5074, lng: -0.1278 },
      "new york": { lat: 40.7128, lng: -74.006 },
      bangkok: { lat: 13.7563, lng: 100.5018 },
      singapore: { lat: 1.3521, lng: 103.8198 },
      sydney: { lat: -33.8688, lng: 151.2093 },
    }

    if (destinationContext) {
      const key = destinationContext.toLowerCase()
      for (const [city, coords] of Object.entries(fallbackCoordinates)) {
        if (key.includes(city)) {
          return {
            latitude: coords.lat,
            longitude: coords.lng,
            formatted_address: destinationContext,
            confidence: "low",
          }
        }
      }
    }

    return null
  }

  clearCache(): void {
    this.cache = {}
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
    }
  }
}

export const geocodingAgent = new GeocodingAgent()
