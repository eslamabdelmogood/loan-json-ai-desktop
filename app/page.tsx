"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LoanOverview } from "@/components/loan-overview"
import { LoanJsonViewer } from "@/components/loan-json-viewer"
import { EventTimeline } from "@/components/event-timeline"
import { AiInsights } from "@/components/ai-insights"
import { CovenantMonitoring } from "@/components/covenant-monitoring"
import { mockLoanData } from "@/lib/mock-data"
import { UploadButtons } from "@/components/upload-buttons"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Code2, X } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [loanData, setLoanData] = useState(mockLoanData)
  const [showJsonModal, setShowJsonModal] = useState(false)

  return (
    <div className="min-h-screen">
      <Header />
      <Toaster position="top-right" />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="ml-64 flex-1 p-6">
          <div className="container max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="p-6 bg-card rounded-lg border border-border shadow-sm flex-1 mr-4">
                <h2 className="terminal-heading text-sm mb-4 text-foreground">Loan Document Management</h2>
                <UploadButtons onDataLoaded={setLoanData} />
              </div>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 h-[120px] px-6 flex-col bg-transparent"
                onClick={() => setShowJsonModal(true)}
              >
                <Code2 className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">View Raw JSON</p>
                  <p className="text-xs text-muted-foreground font-normal">Inspect LoanJSON data</p>
                </div>
              </Button>
            </div>

            {activeSection === "overview" && (
              <div className="space-y-6">
                <LoanOverview data={loanData} />
                <CovenantMonitoring data={loanData} />
              </div>
            )}
            {activeSection === "loanjson" && <LoanJsonViewer data={loanData} />}
            {activeSection === "timeline" && <EventTimeline events={loanData.timeline} />}
            {activeSection === "insights" && <AiInsights data={loanData} />}
          </div>
        </main>
      </div>

      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-6">
          <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col border-primary/30">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="terminal-heading text-lg text-foreground">Raw LoanJSON Data</h2>
                <p className="text-xs text-muted-foreground mt-1">Structured loan data in JSON format</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowJsonModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="rounded-lg bg-muted/30 p-4">
                <pre className="terminal-text text-foreground leading-relaxed">
                  <code>{JSON.stringify(loanData, null, 2)}</code>
                </pre>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(loanData, null, 2))}
              >
                Copy JSON
              </Button>
              <Button onClick={() => setShowJsonModal(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
