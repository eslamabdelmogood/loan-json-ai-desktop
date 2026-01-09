"use client"
import { FileJson, Clock, Sparkles, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "loanjson", label: "LoanJSON Viewer", icon: FileJson },
    { id: "timeline", label: "Event Timeline", icon: Clock },
    { id: "insights", label: "AI Insights", icon: Sparkles },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card">
      <nav className="flex flex-col gap-0 p-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-[11px] terminal-heading transition-colors border-l-2 mb-1",
                activeSection === section.id
                  ? "bg-primary/20 text-terminal-amber border-terminal-amber"
                  : "text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <div className="terminal-text text-[10px]">
          <p className="terminal-heading text-terminal-amber mb-1">System Status</p>
          <p className="text-muted-foreground">Connected: LMA-001</p>
          <p className="text-terminal-green uppercase mt-1">● Terminal Live</p>
        </div>
      </div>
    </aside>
  )
}
