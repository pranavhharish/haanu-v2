"use client"
import { Label } from "@/components/ui/label"
import type React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DateInputsProps {
  fromDate: Date | undefined
  toDate: Date | undefined
  onFromDateChange: (date: Date | undefined) => void
  onToDateChange: (date: Date | undefined) => void
  className?: string
}

export function DateInputs({ fromDate, toDate, onFromDateChange, onToDateChange, className }: DateInputsProps) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0]

  // Format date for input value
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  // Handle from date change
  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      onFromDateChange(new Date(value))
    } else {
      onFromDateChange(undefined)
    }
  }

  // Handle to date change
  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      onToDateChange(new Date(value))
    } else {
      onToDateChange(undefined)
    }
  }

  // Get minimum date for "to" field (either today or from date)
  const getMinToDate = () => {
    if (fromDate) {
      return formatDateForInput(fromDate)
    }
    return today
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* From Date */}
      <div className="space-y-2">
        <Label htmlFor="from-date" className="text-sm font-medium">
          From Date
        </Label>
        <Input
          id="from-date"
          type="date"
          value={formatDateForInput(fromDate)}
          onChange={handleFromDateChange}
          min={today}
          className="h-12"
        />
      </div>

      {/* To Date */}
      <div className="space-y-2">
        <Label htmlFor="to-date" className="text-sm font-medium">
          To Date
        </Label>
        <Input
          id="to-date"
          type="date"
          value={formatDateForInput(toDate)}
          onChange={handleToDateChange}
          min={getMinToDate()}
          className="h-12"
        />
      </div>
    </div>
  )
}
