"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react"
import { mockLoanData } from "@/lib/mock-data"
import { toast } from "sonner"

interface UploadButtonsProps {
  onDataLoaded: (data: any) => void
}

export function UploadButtons({ onDataLoaded }: UploadButtonsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [extractedPreview, setExtractedPreview] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const simulateProgress = async () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 300)
    return interval
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setIsAnalyzing(true)
    setStatus({ type: null, message: "" })
    setExtractedPreview(null)

    const progressInterval = await simulateProgress()

    try {
      const content = await file.text()

      const lines = content.split("\n").filter((line) => line.trim())
      const preview = {
        fileName: file.name,
        fileType: file.type || "text/plain",
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        linesOfText: lines.length,
        preview: lines.slice(0, 3).join(" ").substring(0, 150) + "...",
      }
      setExtractedPreview(preview)

      const response = await fetch("/api/convert-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          fileName: file.name,
          fileType: file.type,
        }),
      })

      const result = await response.json()

      setProgress(100)

      if (result.success) {
        onDataLoaded(result.data)
        setStatus({ type: "success", message: result.message })
        toast.success(result.message)
      } else {
        throw new Error(result.error || "Invalid or unsupported loan document")
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message })
      toast.error(error.message)
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
      setIsAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const loadSample = () => {
    onDataLoaded(mockLoanData)
    setStatus({ type: "success", message: "Sample loan loaded successfully" })
    setExtractedPreview(null)
    toast.success("Sample loan loaded")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".json,.pdf,.txt,.text"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload Loan File
        </Button>
        <Button variant="secondary" onClick={loadSample} disabled={isUploading}>
          <FileText className="mr-2 h-4 w-4" />
          Load Sample Loan
        </Button>
      </div>

      {isAnalyzing && extractedPreview && (
        <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-terminal-amber animate-pulse" />
            <p className="text-sm font-semibold text-foreground">AI Analyzing...</p>
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div>
              <p className="text-muted-foreground uppercase tracking-wider">File</p>
              <p className="text-foreground font-mono truncate">{extractedPreview.fileName}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider">Size</p>
              <p className="text-foreground font-mono">{extractedPreview.fileSize}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground uppercase tracking-wider">Content Preview</p>
              <p className="text-foreground font-mono text-[11px] line-clamp-2 mt-1">{extractedPreview.preview}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-wider">Conversion Progress</span>
              <span className="text-terminal-amber font-mono font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-terminal-amber to-terminal-cyan rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status Messages */}
          <div className="text-xs text-muted-foreground space-y-1">
            {progress > 20 && <p>• Parsing document structure...</p>}
            {progress > 40 && <p>• Extracting loan parameters...</p>}
            {progress > 60 && <p>• Converting to LoanJSON format...</p>}
            {progress > 80 && <p>• Validating data integrity...</p>}
          </div>
        </div>
      )}

      {status.type && !isAnalyzing && (
        <div
          className={`flex items-center gap-2 text-sm font-medium p-3 rounded-lg border ${
            status.type === "success"
              ? "bg-success/10 text-success border-success/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}
    </div>
  )
}
