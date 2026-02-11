"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ViewPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  badge?: string
}

export function ViewPanel({ title, subtitle, children, className, badge }: ViewPanelProps) {
  return (
    <div className={cn("bg-card border border-border rounded-lg overflow-hidden flex flex-col", className)}>
      <div className="px-2 py-1.5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-foreground">{title}</h3>
          {subtitle && <span className="text-[10px] text-muted-foreground hidden sm:inline">{subtitle}</span>}
        </div>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
