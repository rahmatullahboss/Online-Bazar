"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon, RotateCcw } from "lucide-react"

type Mode = "single" | "range"

function toDateOnly(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  const parts = value.split("-")
  if (parts.length !== 3) return undefined
  const [yearStr, monthStr, dayStr] = parts
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return undefined
  }
  return new Date(year, month - 1, day)
}

export function DateFilter({
  initialMode,
  initialDate,
  initialStart,
  initialEnd,
}: {
  initialMode: Mode
  initialDate?: string
  initialStart?: string
  initialEnd?: string
}) {
  const router = useRouter()
  const sp = useSearchParams()

  const [mode, setMode] = React.useState<Mode>(initialMode)
  const [single, setSingle] = React.useState<Date | undefined>(
    parseDateOnly(initialDate) ?? new Date()
  )
  const [range, setRange] = React.useState<DateRange | undefined>(() => {
    const from = parseDateOnly(initialStart)
    const to = parseDateOnly(initialEnd)
    // Only set an initial range when `from` exists; otherwise keep undefined
    return from ? { from, to } : undefined
  })

  function apply() {
    const params = new URLSearchParams(sp?.toString() || "")
    // Clean prior values
    params.delete("date")
    params.delete("start")
    params.delete("end")

    if (mode === "single" && single) {
      params.set("date", toDateOnly(single))
    } else if (mode === "range" && range?.from && range?.to) {
      params.set("start", toDateOnly(range.from))
      params.set("end", toDateOnly(range.to))
    }
    router.push(`/admin-dashboard?${params.toString()}`)
  }

  function resetToday() {
    const today = new Date()
    setMode("single")
    setSingle(today)
    const params = new URLSearchParams(sp?.toString() || "")
    params.delete("start"); params.delete("end"); params.set("date", toDateOnly(today))
    router.push(`/admin-dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="size-4" />
            Select Date
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-3" sideOffset={8}>
          <div className="flex flex-col gap-3">
            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as Mode)}>
              <ToggleGroupItem value="single" aria-label="Single day">Single Day</ToggleGroupItem>
              <ToggleGroupItem value="range" aria-label="Date range">Date Range</ToggleGroupItem>
            </ToggleGroup>
            {mode === "single" ? (
              <Calendar
                mode="single"
                selected={single}
                onSelect={(val?: Date) => setSingle(val)}
                numberOfMonths={1}
                captionLayout="dropdown"
              />
            ) : (
              <Calendar
                mode="range"
                selected={range}
                onSelect={(val?: DateRange) => setRange(val)}
                numberOfMonths={1}
                captionLayout="dropdown"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetToday} className="gap-1">
                <RotateCcw className="size-4" /> Today
              </Button>
              <Button size="sm" onClick={apply} disabled={(mode === "single" && !single) || (mode === "range" && !(range?.from && range?.to))}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateFilter
