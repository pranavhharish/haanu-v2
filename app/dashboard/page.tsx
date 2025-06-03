"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plane,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Globe,
  Share2,
  Trash2,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react"

import { ProfileSidebar } from "@/components/profile-sidebar"
import { useTrips } from "@/hooks/use-trips"

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const { trips, loading: tripsLoading, deleteTrip, refetch, error } = useTrips()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  // Refetch trips when navigating back to the dashboard
  useEffect(() => {
    const handleRouteChange = () => {
      if (user) {
        refetch()
      }
    }

    // Listen for when the component becomes visible
    window.addEventListener("focus", handleRouteChange)

    // Clean up
    return () => {
      window.removeEventListener("focus", handleRouteChange)
    }
  }, [user, refetch])

  // Refetch trips when user changes
  useEffect(() => {
    if (user) {
      console.log("Dashboard - User authenticated, fetching trips for:", user.id)
      refetch()
    }
  }, [user, refetch])

  // Add this after the useTrips hook declaration
  useEffect(() => {
    console.log("Dashboard - trips data:", trips)
    console.log("Dashboard - loading state:", tripsLoading)
    console.log("Dashboard - error state:", error)
  }, [trips, tripsLoading, error])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Calculate stats
  const totalTrips = trips.length
  const upcomingTrips = trips.filter((trip) => new Date(trip.from_date) > new Date()).length
  const countriesVisited = new Set(
    trips
      .filter((trip) => trip.status === "completed")
      .map((trip) => {
        const parts = trip.destination.split(", ")
        return parts.length > 1 ? parts[1] : parts[0]
      }),
  ).size

  // Filter and sort trips
  const filteredTrips = trips
    .filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.from_date).getTime() - new Date(b.from_date).getTime()
        case "byDate":
          return new Date(a.from_date).getTime() - new Date(b.from_date).getTime()
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateTripDuration = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">Haanu</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                onClick={() => router.push("/create-trip")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>

              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                onClick={() => setIsProfileSidebarOpen(true)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                    alt={user.user_metadata?.full_name || user.email}
                  />
                  <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  onClick={() => router.push("/create-trip")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Trip
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setIsProfileSidebarOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plane className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Total Trips</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-800">{totalTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Upcoming</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-800">{upcomingTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Countries</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-800">{countriesVisited}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px] h-11">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="byDate">By Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="flex items-center gap-2"
            disabled={tripsLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={tripsLoading ? "animate-spin" : ""}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Refresh Trips
          </Button>
        </div>

        {/* Loading State */}
        {tripsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-600">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-red-500 text-center">
              <p className="font-medium">Error loading trips</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Trip Cards Grid */}
            {filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0"
                  >
                    <div className="relative">
                      <img
                        src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(trip.destination)}`}
                        alt={trip.destination}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(trip.status)} border`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </Badge>
                    </div>

                    <CardContent className="p-4 lg:p-6">
                      <div className="mb-4">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-1">{trip.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {trip.destination}
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(trip.from_date).toLocaleDateString()} -{" "}
                          {new Date(trip.to_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {calculateTripDuration(trip.from_date, trip.to_date)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Budget</span>
                          <span className="font-medium">
                            {trip.currency} {trip.budget?.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-9"
                          onClick={() => router.push(`/trip/${trip.id}/plan`)}
                        >
                          Continue Planning
                        </Button>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200"
                            onClick={() => deleteTrip(trip.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No trips found</h3>
                <p className="text-gray-500 mb-6">
                  {trips.length === 0 ? "Start planning your first adventure!" : "Try adjusting your search or filters"}
                </p>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  onClick={() => router.push("/create-trip")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <ProfileSidebar isOpen={isProfileSidebarOpen} onClose={() => setIsProfileSidebarOpen(false)} />
    </div>
  )
}
