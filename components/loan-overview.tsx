import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, AlertTriangle, CheckCircle2, Building2, Calendar, Euro } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoanOverviewProps {
  data: any
}

export function LoanOverview({ data }: LoanOverviewProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const breachedCovenants = data.covenants.filter((c: any) => c.status === "breached")
  const compliantCovenants = data.covenants.filter((c: any) => c.status === "compliant")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-balance">Loan Overview</h2>
        <p className="text-muted-foreground mt-1">Comprehensive view of loan status and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Loan ID</p>
              <p className="text-2xl font-bold">{data.loan_id}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Principal Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(data.loan_terms.principal.amount, data.loan_terms.principal.currency)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Euro className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Maturity Date</p>
              <p className="text-2xl font-bold">
                {new Date(data.loan_terms.maturity_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Borrower Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Borrower Information</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Company Name</p>
            <p className="font-medium">{data.borrower.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Jurisdiction</p>
            <p className="font-medium">{data.borrower.jurisdiction}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Sector</p>
            <p className="font-medium">{data.borrower.sector}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Credit Rating</p>
            <Badge variant="secondary" className="font-mono">
              {data.borrower.credit_rating}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Risk Assessment */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Risk Assessment</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trend</span>
              <Badge variant="destructive" className="capitalize">
                {data.risk_engine.trend}
              </Badge>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className={cn("text-3xl font-bold", getRiskColor(data.risk_engine.health_score))}>
                  {data.risk_engine.health_score}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    getRiskColor(data.risk_engine.health_score).replace("text", "bg"),
                  )}
                  style={{ width: `${data.risk_engine.health_score}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Trend</p>
              <Badge variant="destructive" className="capitalize">
                {data.risk_engine.trend}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Probability of Default (90d)</p>
              <p className="text-xl font-bold">
                {(data.risk_engine.prediction.probability_of_default * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Covenant Status</h3>
            {breachedCovenants.length > 0 && <AlertTriangle className="h-5 w-5 text-destructive" />}
          </div>
          <div className="space-y-4">
            {breachedCovenants.length > 0 && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">
                    {breachedCovenants.length} Covenant{breachedCovenants.length > 1 ? "s" : ""} Breached
                  </p>
                </div>
                <div className="space-y-2">
                  {breachedCovenants.map((covenant: any) => (
                    <div key={covenant.id} className="text-sm">
                      <p className="font-medium">{covenant.description}</p>
                      <p className="text-muted-foreground">
                        Current: {covenant.current_value}
                        {covenant.unit} (Target: {covenant.threshold}
                        {covenant.unit})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <p className="text-sm font-semibold text-success">
                  {compliantCovenants.length} Covenant{compliantCovenants.length > 1 ? "s" : ""} Compliant
                </p>
              </div>
              {compliantCovenants.slice(0, 2).map((covenant: any) => (
                <div key={covenant.id} className="text-sm pl-6">
                  <p className="font-medium text-muted-foreground">{covenant.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Interest Rate */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interest Rate Structure</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
            <p className="font-medium capitalize">{data.loan_terms.interest_rate.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Base Rate</p>
            <p className="font-medium">{data.loan_terms.interest_rate.base}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Margin</p>
            <p className="font-medium">{data.loan_terms.interest_rate.margin}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Current All-In Rate</p>
            <p className="text-xl font-bold text-primary">{data.loan_terms.interest_rate.current_all_in}%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
