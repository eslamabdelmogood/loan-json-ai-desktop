"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle2,
  Volume2,
  Play,
  Pause,
  Square,
  Activity,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AiInsightsProps {
  data: any
}

export function AiInsights({ data }: AiInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [activeInsight, setActiveInsight] = useState<string | null>(null)
  const [insightData, setInsightData] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const generateInsight = async (type: string) => {
    setLoading(true)
    setActiveInsight(type)
    stopAudio()

    try {
      const response = await fetch("/api/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanData: data, insightType: type }),
      })

      const result = await response.json()
      setInsightData(result)
    } catch (error) {
      console.error("Error generating insight:", error)
      setInsightData({
        error: "Failed to generate insight. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTts = async () => {
    if (!insightData || !insightData.rawText || !synthRef.current) return

    if (isPlaying) {
      stopAudio()
      return
    }

    setTtsLoading(true)
    try {
      synthRef.current.cancel()

      const summaryResponse = await fetch("/api/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanData: data,
          insightType: "summary-voice",
          currentInsight: insightData.rawText,
        }),
      })
      const { rawText: summaryText } = await summaryResponse.json()

      const cleanText = summaryText.replace(/[*#_~`>]/g, "")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utteranceRef.current = utterance

      const voices = synthRef.current.getVoices()
      const preferredVoice =
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Samantha")) ||
        voices.find((v) => v.lang.startsWith("en-"))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.pitch = 1
      utterance.rate = 0.95
      utterance.volume = 1

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        setIsPlaying(false)
        utteranceRef.current = null
      }
      utterance.onerror = (event) => {
        if (event.error === "interrupted") {
          console.log("[v0] Speech interrupted intentionally")
          return
        }
        console.error("[v0] Speech Synthesis Error:", event)
        setIsPlaying(false)
        utteranceRef.current = null
      }

      synthRef.current.speak(utterance)
    } catch (error) {
      console.error("[v0] TTS Error:", error)
    } finally {
      setTtsLoading(false)
    }
  }

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      utteranceRef.current = null
    }
  }

  const togglePlayback = () => {
    if (synthRef.current) {
      if (isPlaying) {
        synthRef.current.pause()
        setIsPlaying(false)
      } else {
        if (synthRef.current.paused) {
          synthRef.current.resume()
          setIsPlaying(true)
        } else if (utteranceRef.current) {
          synthRef.current.cancel()
          synthRef.current.speak(utteranceRef.current)
          setIsPlaying(true)
        }
      }
    }
  }

  const getRiskAssessment = (score: number) => {
    if (score >= 80)
      return {
        level: "LOW RISK",
        color: "text-terminal-green",
        bgColor: "bg-terminal-green/10",
        borderColor: "border-terminal-green/30",
        description:
          "Strong credit quality with minimal default probability. Loan exhibits healthy covenant compliance and stable borrower performance metrics.",
      }
    if (score >= 60)
      return {
        level: "MODERATE RISK",
        color: "text-terminal-amber",
        bgColor: "bg-terminal-amber/10",
        borderColor: "border-terminal-amber/30",
        description:
          "Acceptable risk profile with some areas requiring monitoring. Borrower shows satisfactory performance with manageable covenant compliance challenges.",
      }
    return {
      level: "HIGH RISK",
      color: "text-terminal-red",
      bgColor: "bg-terminal-red/10",
      borderColor: "border-terminal-red/30",
      description:
        "Elevated credit risk requiring immediate attention. Multiple covenant breaches and declining trend indicate potential default scenarios within forecast horizon.",
    }
  }

  const riskAssessment = getRiskAssessment(data.risk_engine?.health_score || 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-balance">AI Insights</h2>
        <p className="text-muted-foreground mt-1">Powered by Google Gemini AI for banking professionals</p>
      </div>

      <Card className={cn("p-6 border", riskAssessment.borderColor, riskAssessment.bgColor)}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
            <Activity className={cn("h-6 w-6", riskAssessment.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="terminal-heading text-sm text-foreground">Risk Score Analysis</h3>
              <Badge variant="outline" className={cn("terminal-badge", riskAssessment.color, "border-current")}>
                {riskAssessment.level}
              </Badge>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Score</p>
                <div className={cn("terminal-number text-4xl font-bold", riskAssessment.color)}>
                  {data.risk_engine?.health_score || 0}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  90-Day Default Probability
                </p>
                <div className={cn("terminal-number text-4xl font-bold", riskAssessment.color)}>
                  {((data.risk_engine?.prediction?.probability_of_default || 0) * 100).toFixed(1)}
                  <span className="text-lg text-muted-foreground font-normal">%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{riskAssessment.description}</p>
            {data.risk_engine?.prediction?.factors && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Key Risk Factors</p>
                <ul className="grid grid-cols-1 gap-1.5">
                  {data.risk_engine.prediction.factors.map((factor: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <span className={cn("mt-0.5", riskAssessment.color)}>▸</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          size="lg"
          variant={activeInsight === "explain" ? "default" : "outline"}
          className="h-auto flex-col gap-3 py-6"
          onClick={() => generateInsight("explain")}
          disabled={loading}
        >
          <FileText className="h-6 w-6" />
          <div className="text-center">
            <p className="font-semibold">Explain Loan</p>
            <p className="text-xs text-muted-foreground font-normal">Get comprehensive loan explanation</p>
          </div>
        </Button>

        <Button
          size="lg"
          variant={activeInsight === "risk" ? "default" : "outline"}
          className="h-auto flex-col gap-3 py-6"
          onClick={() => generateInsight("risk")}
          disabled={loading}
        >
          <AlertTriangle className="h-6 w-6" />
          <div className="text-center">
            <p className="font-semibold">Risk Summary</p>
            <p className="text-xs text-muted-foreground font-normal">Analyze risks and mitigation strategies</p>
          </div>
        </Button>

        <Button
          size="lg"
          variant={activeInsight === "esg" ? "default" : "outline"}
          className="h-auto flex-col gap-3 py-6"
          onClick={() => generateInsight("esg")}
          disabled={loading}
        >
          <TrendingUp className="h-6 w-6" />
          <div className="text-center">
            <p className="font-semibold">ESG Impact</p>
            <p className="text-xs text-muted-foreground font-normal">Evaluate ESG considerations</p>
          </div>
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing loan data with AI...</p>
          </div>
        </Card>
      )}

      {/* Insight Display */}
      {!loading && insightData && !insightData.error && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{insightData.title}</h3>
                  <Badge variant="secondary">AI Generated</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insightData.subtitle}</p>
              </div>
            </div>

            {/* Voice Summary Button and Controls */}
            <div className="flex items-center gap-2">
              {isPlaying && (
                <div className="flex items-center gap-1 bg-primary/5 rounded-full px-3 py-1 border border-primary/20">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={stopAudio}>
                    <Square className="h-3 w-3 fill-current" />
                  </Button>
                  <span className="text-[10px] font-medium text-primary animate-pulse uppercase tracking-wider">
                    Listening
                  </span>
                </div>
              )}

              {!isPlaying && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={handleTts}
                  disabled={ttsLoading}
                >
                  {ttsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  Listen to Summary
                </Button>
              )}
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="space-y-4 text-foreground">
              {insightData.sections?.map((section: any, index: number) => (
                <div key={index}>
                  <h4 className="font-semibold text-foreground mb-2">{section.heading}</h4>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          {insightData.recommendations && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Strategic Recommendations</h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {insightData.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex gap-2 leading-relaxed">
                    <span className="text-primary font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Error State */}
      {!loading && insightData?.error && (
        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">{insightData.error}</p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      {!activeInsight && !loading && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">AI-Powered Banking Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI assistant uses Google Gemini to provide conservative, regulator-friendly analysis of loan data.
                Select an insight type above to receive clear, non-technical explanations suitable for compliance
                reporting and risk assessment. All analysis is based on the standardized LoanJSON format.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
