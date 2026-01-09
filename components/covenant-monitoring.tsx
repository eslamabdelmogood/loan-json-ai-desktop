import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CovenantMonitoringProps {
  data: any
}

export function CovenantMonitoring({ data }: CovenantMonitoringProps) {
  const covenants = data.covenants || []
  const breachedCovenants = covenants.filter((c: any) => c.status === "breached")
  const compliantCovenants = covenants.filter((c: any) => c.status === "compliant")

  const complianceRate =
    covenants.length > 0 ? ((compliantCovenants.length / covenants.length) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="terminal-heading text-base text-foreground">Covenant Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-1">Real-time compliance tracking</p>
        </div>
        <div className="text-right">
          <div className="terminal-number text-2xl font-bold text-foreground">{complianceRate}%</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Compliance Rate</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-terminal-green/30 bg-terminal-green/5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-5 w-5 text-terminal-green" />
            <TrendingUp className="h-4 w-4 text-terminal-green" />
          </div>
          <div className="terminal-number text-3xl font-bold text-terminal-green mb-1">{compliantCovenants.length}</div>
          <p className="terminal-heading text-[10px] text-terminal-green">Compliant</p>
        </Card>

        <Card className="p-4 border-terminal-red/30 bg-terminal-red/5">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-terminal-red" />
            <TrendingDown className="h-4 w-4 text-terminal-red" />
          </div>
          <div className="terminal-number text-3xl font-bold text-terminal-red mb-1">{breachedCovenants.length}</div>
          <p className="terminal-heading text-[10px] text-terminal-red">Breached</p>
        </Card>
      </div>

      {/* Covenant List */}
      <Card className="p-0 overflow-hidden border-border/50">
        <div className="terminal-grid grid-cols-[1fr_auto_auto_auto] text-xs">
          {/* Header */}
          <div className="terminal-cell bg-muted/50">
            <p className="terminal-heading text-[10px] text-muted-foreground">Covenant</p>
          </div>
          <div className="terminal-cell bg-muted/50">
            <p className="terminal-heading text-[10px] text-muted-foreground text-right">Current</p>
          </div>
          <div className="terminal-cell bg-muted/50">
            <p className="terminal-heading text-[10px] text-muted-foreground text-right">Threshold</p>
          </div>
          <div className="terminal-cell bg-muted/50">
            <p className="terminal-heading text-[10px] text-muted-foreground text-center">Status</p>
          </div>

          {/* Data Rows */}
          {covenants.map((covenant: any) => {
            const isBreached = covenant.status === "breached"
            const statusColor = isBreached ? "text-terminal-red" : "text-terminal-green"
            const bgColor = isBreached ? "bg-terminal-red/10" : "bg-card"

            return (
              <div key={covenant.id} className="contents">
                <div className={cn("terminal-cell", bgColor)}>
                  <p className="text-foreground font-medium text-[11px] leading-tight">{covenant.description}</p>
                  <p className="text-muted-foreground text-[9px] uppercase tracking-wider mt-0.5">{covenant.id}</p>
                </div>
                <div className={cn("terminal-cell", bgColor)}>
                  <p className={cn("terminal-number text-right font-bold", statusColor)}>
                    {covenant.current_value}
                    {covenant.unit === "percent" ? "%" : covenant.unit === "ratio" ? "x" : ""}
                  </p>
                </div>
                <div className={cn("terminal-cell", bgColor)}>
                  <p className="terminal-number text-right text-muted-foreground">
                    {covenant.threshold}
                    {covenant.unit === "percent" ? "%" : covenant.unit === "ratio" ? "x" : ""}
                  </p>
                </div>
                <div className={cn("terminal-cell", bgColor, "flex items-center justify-center")}>
                  <Badge
                    variant={isBreached ? "destructive" : "secondary"}
                    className={cn(
                      "terminal-badge",
                      isBreached
                        ? "bg-terminal-red text-background border-terminal-red"
                        : "bg-terminal-green text-background border-terminal-green",
                    )}
                  >
                    {isBreached ? "BREACH" : "OK"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Alert Banner for Breaches */}
      {breachedCovenants.length > 0 && (
        <Card className="p-4 border-terminal-red bg-terminal-red/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-terminal-red shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="terminal-heading text-xs text-terminal-red mb-2">Immediate Action Required</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {breachedCovenants.length} covenant{breachedCovenants.length > 1 ? "s are" : " is"} currently breached.
                Review mitigation strategies and prepare waiver requests if necessary. Contact relationship manager for
                remediation plan.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
