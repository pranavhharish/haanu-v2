"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { DateInputs } from "@/components/date-inputs"
import { cn } from "@/lib/utils"
import {
  Plane,
  MapPin,
  Users,
  Mountain,
  Utensils,
  Landmark,
  Music,
  ShoppingBag,
  SpadeIcon as Spa,
  Camera,
  Map,
  Save,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Plus,
} from "lucide-react"
import { useTrips } from "@/hooks/use-trips"

// Define the interest options
const interestOptions = [
  { id: "adventure", label: "Adventure & Outdoors", icon: <Mountain className="h-4 w-4" /> },
  { id: "food", label: "Food & Dining", icon: <Utensils className="h-4 w-4" /> },
  { id: "culture", label: "Culture & History", icon: <Landmark className="h-4 w-4" /> },
  { id: "nightlife", label: "Nightlife & Entertainment", icon: <Music className="h-4 w-4" /> },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "relaxation", label: "Relaxation & Wellness", icon: <Spa className="h-4 w-4" /> },
  { id: "photography", label: "Photography", icon: <Camera className="h-4 w-4" /> },
  { id: "local", label: "Local Experiences", icon: <Map className="h-4 w-4" /> },
  { id: "others", label: "Others", icon: <Plus className="h-4 w-4" /> },
]

// Define the currency options
const currencyOptions = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "JPY", label: "JPY (¥)", symbol: "¥" },
]

// Define the form state type
type FormState = {
  tripName: string
  destination: string
  numPeople: string
  budget: string
  currency: string
  fromDate: Date | undefined
  toDate: Date | undefined
  interests: string[]
  customInterests: string[]
}

// Define the validation errors type
type FormErrors = {
  tripName?: string
  destination?: string
  numPeople?: string
  budget?: string
  fromDate?: string
  toDate?: string
  interests?: string
}

export default function CreateTripPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0])
  const [customInterest, setCustomInterest] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const { createTrip } = useTrips()

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Form state
  const [formState, setFormState] = useState<FormState>({
    tripName: "",
    destination: "",
    numPeople: "2",
    budget: "",
    currency: "USD",
    fromDate: undefined,
    toDate: undefined,
    interests: [],
    customInterests: [],
  })

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({})

  // Mock destination search
  const mockDestinations = [
    "Tokyo, Japan",
    "Paris, France",
    "New York, USA",
    "London, UK",
    "Rome, Italy",
    "Barcelona, Spain",
    "Sydney, Australia",
    "Bangkok, Thailand",
    "Dubai, UAE",
    "Singapore",
  ]

  // Handle destination search
  const handleDestinationSearch = (value: string) => {
    setFormState({ ...formState, destination: value })
    if (value.length > 1) {
      const results = mockDestinations.filter((dest) => dest.toLowerCase().includes(value.toLowerCase()))
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }

  // Handle destination selection
  const handleDestinationSelect = (destination: string) => {
    setFormState({ ...formState, destination })
    setShowSearchResults(false)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState({ ...formState, [name]: value })

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  // Handle budget input
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setFormState({ ...formState, budget: value })

    // Clear error when user types
    if (errors.budget) {
      setErrors({ ...errors, budget: undefined })
    }
  }

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setFormState({ ...formState, currency: value })
    const selected = currencyOptions.find((c) => c.value === value)
    if (selected) {
      setSelectedCurrency(selected)
    }
  }

  // Handle from date change
  const handleFromDateChange = (date: Date | undefined) => {
    setFormState({ ...formState, fromDate: date })

    // Clear error when user selects date
    if (errors.fromDate) {
      setErrors({ ...errors, fromDate: undefined })
    }
  }

  // Handle to date change
  const handleToDateChange = (date: Date | undefined) => {
    setFormState({ ...formState, toDate: date })

    // Clear error when user selects date
    if (errors.toDate) {
      setErrors({ ...errors, toDate: undefined })
    }
  }

  // Handle interest toggle
  const handleInterestToggle = (interestId: string) => {
    if (interestId === "others") {
      setShowCustomInput(!showCustomInput)
      if (showCustomInput) {
        // If hiding custom input, remove "others" from interests
        const updatedInterests = formState.interests.filter((id) => id !== "others")
        setFormState({ ...formState, interests: updatedInterests })
        setCustomInterest("")
      }
      return
    }

    const updatedInterests = formState.interests.includes(interestId)
      ? formState.interests.filter((id) => id !== interestId)
      : [...formState.interests, interestId]

    setFormState({ ...formState, interests: updatedInterests })

    // Clear error when user selects interests
    if (errors.interests && updatedInterests.length > 0) {
      setErrors({ ...errors, interests: undefined })
    }
  }

  // Handle custom interest submission
  const handleCustomInterestSubmit = () => {
    if (customInterest.trim()) {
      const updatedInterests = [...formState.interests, "others"]
      const updatedCustomInterests = [...formState.customInterests, customInterest.trim()]
      setFormState({
        ...formState,
        interests: updatedInterests,
        customInterests: updatedCustomInterests,
      })
      setCustomInterest("")

      // Clear error when user adds custom interest
      if (errors.interests) {
        setErrors({ ...errors, interests: undefined })
      }
    }
  }

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (currentStep === 1) {
      if (!formState.tripName.trim()) {
        newErrors.tripName = "Trip name is required"
      }
      if (!formState.destination.trim()) {
        newErrors.destination = "Destination is required"
      }
    } else if (currentStep === 2) {
      if (!formState.budget.trim()) {
        newErrors.budget = "Budget is required"
      }
      if (!formState.fromDate) {
        newErrors.fromDate = "Start date is required"
      }
      if (!formState.toDate) {
        newErrors.toDate = "End date is required"
      }
    } else if (currentStep === 3) {
      if (formState.interests.length === 0) {
        newErrors.interests = "At least one interest is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Handle save draft
  const handleSaveDraft = () => {
    console.log("Saving draft:", formState)
    // Show a toast or notification that draft was saved
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsSubmitting(true)

      try {
        const tripData = {
          name: formState.tripName,
          destination: formState.destination,
          num_people: Number.parseInt(formState.numPeople),
          budget: Number.parseFloat(formState.budget),
          currency: formState.currency,
          from_date: formState.fromDate!.toISOString().split("T")[0],
          to_date: formState.toDate!.toISOString().split("T")[0],
          interests: formState.interests,
          custom_interests: formState.customInterests,
          status: "planning" as const,
        }

        const { data, error } = await createTrip(tripData)

        if (error) {
          console.error("Error creating trip:", error)
          // You could show an error message to the user here
        } else {
          console.log("Trip created successfully:", data)
          setIsSuccess(true)

          // Redirect to dashboard after success animation
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } catch (error) {
        console.error("Error submitting form:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Calculate trip duration
  const getTripDuration = () => {
    if (formState.fromDate && formState.toDate) {
      const diffTime = Math.abs(formState.toDate.getTime() - formState.fromDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} ${diffDays === 1 ? "day" : "days"}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to landing page
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tripName" className="text-base font-medium">
                  Trip Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tripName"
                  name="tripName"
                  placeholder="e.g. Summer Vacation 2024"
                  value={formState.tripName}
                  onChange={handleInputChange}
                  className={cn("h-12", errors.tripName && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.tripName && <p className="text-sm text-red-500">{errors.tripName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-base font-medium">
                  Destination <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Input
                    id="destination"
                    name="destination"
                    placeholder="Search for a destination"
                    value={formState.destination}
                    onChange={(e) => handleDestinationSearch(e.target.value)}
                    className={cn("h-12 pl-10", errors.destination && "border-red-500 focus-visible:ring-red-500")}
                    onFocus={() => formState.destination.length > 1 && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                      <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                        {searchResults.map((destination) => (
                          <li
                            key={destination}
                            className="cursor-pointer px-4 py-2 hover:bg-orange-50"
                            onMouseDown={() => handleDestinationSelect(destination)}
                          >
                            {destination}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {errors.destination && <p className="text-sm text-red-500">{errors.destination}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numPeople" className="text-base font-medium">
                  Number of People
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <Select
                    value={formState.numPeople}
                    onValueChange={(value) => setFormState({ ...formState, numPeople: value })}
                  >
                    <SelectTrigger className="h-12 pl-10">
                      <SelectValue placeholder="Select number of people" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 10 ? "10+" : num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </>
        )
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Budget & Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-base font-medium">
                  Total Budget <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-3.5 text-gray-400">{selectedCurrency.symbol}</div>
                    <Input
                      id="budget"
                      name="budget"
                      placeholder="0"
                      value={formState.budget}
                      onChange={handleBudgetChange}
                      className={cn("h-12 pl-8", errors.budget && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  <Select value={formState.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="h-12 w-28">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Travel Dates <span className="text-red-500">*</span>
                </Label>
                <DateInputs
                  fromDate={formState.fromDate}
                  toDate={formState.toDate}
                  onFromDateChange={handleFromDateChange}
                  onToDateChange={handleToDateChange}
                />
                {errors.fromDate && <p className="text-sm text-red-500">{errors.fromDate}</p>}
                {errors.toDate && <p className="text-sm text-red-500">{errors.toDate}</p>}

                {getTripDuration() && (
                  <div className="mt-2 text-sm text-gray-600">
                    Trip duration: <span className="font-medium">{getTripDuration()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Select at least one interest to help us personalize your trip recommendations
                  <span className="text-red-500"> *</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest.id}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-orange-50",
                        (formState.interests.includes(interest.id) || (interest.id === "others" && showCustomInput)) &&
                          "border-orange-500 bg-orange-50",
                      )}
                    >
                      <Checkbox
                        id={interest.id}
                        checked={
                          formState.interests.includes(interest.id) || (interest.id === "others" && showCustomInput)
                        }
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="text-orange-500">{interest.icon}</div>
                        <Label htmlFor={interest.id} className="cursor-pointer font-medium">
                          {interest.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Interest Input */}
                {showCustomInput && (
                  <div className="mt-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <Label htmlFor="customInterest" className="text-sm font-medium mb-2 block">
                      Please specify your interest:
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="customInterest"
                        placeholder="e.g. Art galleries, Wine tasting, etc."
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleCustomInterestSubmit()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleCustomInterestSubmit}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={!customInterest.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {formState.customInterests.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formState.customInterests.map((interest, index) => (
                          <div key={index} className="text-sm text-green-600">
                            ✓ {interest}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {errors.interests && <p className="text-sm text-red-500 mt-2">{errors.interests}</p>}
              </div>
            </CardContent>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Plane className="h-8 w-8 text-orange-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Create New Trip</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Basic Info</span>
            <span className="text-sm font-medium text-gray-600">Budget & Dates</span>
            <span className="text-sm font-medium text-gray-600">Interests</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
        </div>

        {/* Success Animation */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-once">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <Card className="rounded-2xl shadow-md overflow-hidden">
            {renderStepContent()}
            <CardFooter className="flex justify-between p-6 bg-gray-50">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep} className="mr-2" disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                {currentStep < 3 && (
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isSubmitting}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Trip
                        <Plane className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
