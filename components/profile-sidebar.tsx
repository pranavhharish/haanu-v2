"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  X,
  User,
  Settings,
  HelpCircle,
  Camera,
  Edit,
  Shield,
  Bell,
  Lock,
  Globe,
  Palette,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  Bug,
  BookOpen,
  Users,
  Play,
  Info,
  LogOut,
  ArrowLeft,
} from "lucide-react"

interface ProfileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type SidebarSection = "main" | "profile" | "settings" | "help"

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const [currentSection, setCurrentSection] = useState<SidebarSection>("main")
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    tripReminders: true,
    budgetAlerts: true,
    publicProfile: false,
    shareTrips: true,
    twoFactor: false,
    darkMode: false,
  })
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = () => {
    setShowLogoutDialog(false)
    onClose()
    window.location.href = "/"
  }

  const renderMainMenu = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start h-12 text-left"
        onClick={() => setCurrentSection("profile")}
      >
        <User className="mr-3 h-5 w-5" />
        <div>
          <div className="font-medium">My Profile</div>
          <div className="text-xs text-gray-500">Personal information & stats</div>
        </div>
        <ChevronRight className="ml-auto h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start h-12 text-left"
        onClick={() => setCurrentSection("settings")}
      >
        <Settings className="mr-3 h-5 w-5" />
        <div>
          <div className="font-medium">Settings</div>
          <div className="text-xs text-gray-500">Account, notifications & privacy</div>
        </div>
        <ChevronRight className="ml-auto h-4 w-4" />
      </Button>

      <Button variant="ghost" className="w-full justify-start h-12 text-left" onClick={() => setCurrentSection("help")}>
        <HelpCircle className="mr-3 h-5 w-5" />
        <div>
          <div className="font-medium">Help & Support</div>
          <div className="text-xs text-gray-500">FAQ, guides & contact</div>
        </div>
        <ChevronRight className="ml-auto h-4 w-4" />
      </Button>
    </div>
  )

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-4 p-0 h-auto" onClick={() => setCurrentSection("main")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="User"
            />
            <AvatarFallback className="text-lg">JD</AvatarFallback>
          </Avatar>
          <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mt-3">John Doe</h3>
        <p className="text-gray-600">john.doe@example.com</p>
        <p className="text-sm text-gray-500">Member since March 2023</p>
      </div>

      {/* Travel Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Travel Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">4</div>
              <div className="text-sm text-gray-600">Trips Completed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Countries Visited</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Upcoming Trips</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Favorite Destinations</h4>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">🇯🇵 Japan</div>
              <div className="text-sm text-gray-600">🇫🇷 France</div>
              <div className="text-sm text-gray-600">🇮🇩 Indonesia</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Actions */}
      <div className="space-y-3">
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>

        <div className="flex items-center justify-between">
          <Label htmlFor="profile-visibility" className="text-sm font-medium">
            Public Profile
          </Label>
          <Switch
            id="profile-visibility"
            checked={settings.publicProfile}
            onCheckedChange={() => toggleSetting("publicProfile")}
          />
        </div>
      </div>
    </div>
  )

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-4 p-0 h-auto" onClick={() => setCurrentSection("main")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail className="mr-2 h-4 w-4" />
            Update Email Preferences
          </Button>
          <div className="flex items-center justify-between">
            <Label htmlFor="two-factor" className="text-sm font-medium">
              Two-Factor Authentication
            </Label>
            <Switch id="two-factor" checked={settings.twoFactor} onCheckedChange={() => toggleSetting("twoFactor")} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-sm font-medium">
              Email Notifications
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => toggleSetting("emailNotifications")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="text-sm font-medium">
              Push Notifications
            </Label>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={() => toggleSetting("pushNotifications")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="trip-reminders" className="text-sm font-medium">
              Trip Reminders
            </Label>
            <Switch
              id="trip-reminders"
              checked={settings.tripReminders}
              onCheckedChange={() => toggleSetting("tripReminders")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="budget-alerts" className="text-sm font-medium">
              Budget Alerts
            </Label>
            <Switch
              id="budget-alerts"
              checked={settings.budgetAlerts}
              onCheckedChange={() => toggleSetting("budgetAlerts")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-trips" className="text-sm font-medium">
              Share Trips with Friends
            </Label>
            <Switch
              id="share-trips"
              checked={settings.shareTrips}
              onCheckedChange={() => toggleSetting("shareTrips")}
            />
          </div>
          <Button variant="outline" className="w-full justify-start">
            Export My Data
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="jpy">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm font-medium">
              Dark Mode
            </Label>
            <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={() => toggleSetting("darkMode")} />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHelpSection = () => (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-4 p-0 h-auto" onClick={() => setCurrentSection("main")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Quick Start Guide
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-left">How to create a trip?</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600">
                Click the "Create New Trip" button in the header, fill out the trip details form, and our AI will help
                you plan the perfect itinerary.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-left">Managing budgets</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600">
                Set your total budget when creating a trip. Track expenses by adding costs to activities and
                accommodations. View progress on your dashboard.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-left">Sharing trips</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600">
                Use the share button on any trip card to generate a shareable link or invite friends via email to
                collaborate on trip planning.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-left">Account settings</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <p className="text-sm text-gray-600">
                Access account settings from your profile menu. Update personal information, change password, and manage
                notification preferences.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <MessageCircle className="mr-2 h-4 w-4" />
            Help Chat
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail className="mr-2 h-4 w-4" />
            Email Support
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bug className="mr-2 h-4 w-4" />
            Report a Bug
          </Button>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Travel Tips Blog
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Community Forum
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Play className="mr-2 h-4 w-4" />
            Video Tutorials
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Info className="mr-2 h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <div>App Version: 2.1.0</div>
          </div>
          <Button variant="outline" className="w-full justify-start">
            Terms of Service
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Privacy Policy
          </Button>

          <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">Are you sure you want to logout?</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Logout
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "profile":
        return renderProfileSection()
      case "settings":
        return renderSettingsSection()
      case "help":
        return renderHelpSection()
      default:
        return renderMainMenu()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-full sm:w-80 lg:w-96`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentSection === "main" && "Profile Menu"}
              {currentSection === "profile" && "My Profile"}
              {currentSection === "settings" && "Settings"}
              {currentSection === "help" && "Help & Support"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">{renderCurrentSection()}</div>
        </div>
      </div>
    </>
  )
}
