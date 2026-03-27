"use client"

import { useState } from "react"
import { Layers, Ticket, Tag, Star, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type ObjectCategory = "all" | "tickets" | "coupons" | "collectibles" | "passes"

interface DigitalObject {
  id: string
  name: string
  category: Exclude<ObjectCategory, "all">
  issuer: string
  description: string
}

const categoryIcons: Record<Exclude<ObjectCategory, "all">, typeof Ticket> = {
  tickets: Ticket,
  coupons: Tag,
  collectibles: Star,
  passes: CreditCard,
}

const mockObjects: DigitalObject[] = [
  {
    id: "1",
    name: "Concert Ticket - Summer Fest",
    category: "tickets",
    issuer: "EventCo",
    description: "General admission - July 15, 2026",
  },
  {
    id: "2",
    name: "Coffee Coupon",
    category: "coupons",
    issuer: "BeanBrew",
    description: "Free latte - valid until Aug 2026",
  },
  {
    id: "3",
    name: "Limited Edition Badge",
    category: "collectibles",
    issuer: "XRPilot",
    description: "Early adopter collectible",
  },
]

function ObjectCard({ obj }: { obj: DigitalObject }) {
  const Icon = categoryIcons[obj.category]

  return (
    <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
      <CardContent className="pt-6 space-y-3">
        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary/60" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {obj.name}
          </p>
          <p className="text-xs text-muted-foreground">{obj.issuer}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {obj.category.slice(0, -1)}
        </Badge>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {obj.description}
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">No objects yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Digital objects like tickets, coupons, and collectibles will appear
          here when you receive them.
        </p>
      </div>
    </div>
  )
}

export default function ObjectsPage() {
  const categories: { value: ObjectCategory; label: string }[] = [
    { value: "all", label: "All" },
    { value: "tickets", label: "Tickets" },
    { value: "coupons", label: "Coupons" },
    { value: "collectibles", label: "Collectibles" },
    { value: "passes", label: "Passes" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Objects</h1>

      <Tabs defaultValue="all">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="min-h-[44px]"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const filtered =
            cat.value === "all"
              ? mockObjects
              : mockObjects.filter((o) => o.category === cat.value)

          return (
            <TabsContent key={cat.value} value={cat.value}>
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filtered.map((obj) => (
                    <ObjectCard key={obj.id} obj={obj} />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
