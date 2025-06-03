"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Sparkles, Clock, Heart, Plane, Star, Loader2 } from "lucide-react"

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const { user, signIn, signUp, loading } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if user is already logged in
  React.useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Plane className="h-8 w-8 text-orange-500" />
          <span className="text-2xl font-bold text-gray-800">Haanu</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors">
            Features
          </a>
          <a href="#about" className="text-gray-600 hover:text-orange-500 transition-colors">
            About
          </a>
          <a href="#contact" className="text-gray-600 hover:text-orange-500 transition-colors">
            Contact
          </a>
        </nav>
        <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
              onClick={() => setIsAuthOpen(true)}
            >
              Sign In
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-gray-800">Welcome to Haanu</DialogTitle>
            </DialogHeader>
            <AuthTabs onSuccess={() => setIsAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Plan Your Perfect Trip with{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience personalized travel planning powered by artificial intelligence. Create unforgettable journeys
            tailored to your interests, budget, and dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsAuthOpen(true)}
            >
              Start Planning
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-full"
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-3xl p-8 shadow-2xl">
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Travel Planning Interface"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
              <MapPin className="h-6 w-6 text-orange-500" />
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce delay-300">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Why Choose Haanu?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the future of travel planning with our AI-powered features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="h-12 w-12 text-orange-500" />}
            title="AI-Powered Planning"
            description="Smart itinerary generation that learns from your preferences and creates personalized travel experiences tailored just for you."
          />
          <FeatureCard
            icon={<Clock className="h-12 w-12 text-orange-500" />}
            title="Real-time Updates"
            description="Dynamic trip adjustments based on weather, local events, and real-time conditions to ensure your trip is always optimized."
          />
          <FeatureCard
            icon={<Heart className="h-12 w-12 text-orange-500" />}
            title="Personalized Experience"
            description="Every recommendation is tailored to your interests, budget, and travel style for truly unique and memorable adventures."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-orange-50 to-orange-100 rounded-3xl mx-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Trusted by Travelers Worldwide</h3>
          <div className="flex justify-center items-center space-x-8 text-gray-600">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">50K+</div>
              <div>Trips Planned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">4.9</div>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">25K+</div>
              <div>Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Plane className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold text-gray-800">Haanu</span>
        </div>
        <p>&copy; 2024 Haanu. All rights reserved. Made with ❤️ for travelers.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 text-center leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function AuthTabs({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isSignUp: boolean) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, fullName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess()
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
          Sign In
        </TabsTrigger>
        <TabsTrigger value="signup" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
          Sign Up
        </TabsTrigger>
      </TabsList>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <TabsContent value="signin">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              className="focus:ring-orange-500 focus:border-orange-500"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
