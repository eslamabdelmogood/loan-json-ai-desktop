"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { useState } from "react"

interface LoanJsonViewerProps {
  data: any
}

export function LoanJsonViewer({ data }: LoanJsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `loan-${data.loan_id}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-balance">LoanJSON Viewer</h2>
          <p className="text-muted-foreground mt-1">Standardized JSON representation of loan data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Schema Version</p>
          <p className="text-lg font-semibold">{data.metadata.version}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Schema Type</p>
          <Badge variant="secondary" className="mt-1">
            {data.metadata.schema_type}
          </Badge>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
          <p className="text-lg font-semibold">
            {new Date(data.metadata.last_updated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Covenants</p>
          <p className="text-lg font-semibold">{data.covenants.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="rounded-lg bg-muted/30 p-4 overflow-x-auto">
          <pre className="text-sm font-mono leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>
      </Card>

      <Card className="p-6 border-primary/30 bg-primary/5">
        <h3 className="text-lg font-semibold mb-3">About LoanJSON Standard</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          LoanJSON is a unified, standardized JSON-based format for loan data representation. It enables seamless
          integration across banking systems, reduces data fragmentation, and provides a foundation for AI-powered
          analytics and automated compliance monitoring. This format is designed to be human-readable, machine-parsable,
          and compliant with regulatory reporting requirements.
        </p>
      </Card>
    </div>
  )
}
