"use client"

import { MapPin, Search } from "lucide-react"
import { useState, useMemo } from "react"
import data from "@/lib/data.json"
import { cn } from "@/lib/utils"

interface CountryStepProps {
  selected: string
  onSelect: (country: string) => void
}

export function CountryStep({ selected, onSelect }: CountryStepProps) {
  const [search, setSearch] = useState("")

  const filteredCountries = useMemo(() => {
    return data.countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Where are you flying from?</h2>
        <p className="text-muted-foreground">Select your country to find available services</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {filteredCountries.map((country) => (
          <button
            key={country.code}
            onClick={() => onSelect(country.code)}
            className={cn(
              "p-4 rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-md",
              selected === country.code
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 text-white shadow-lg"
                : "bg-card hover:bg-muted/50 text-foreground",
            )}
          >
            <span className="font-medium">{country.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
