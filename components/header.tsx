import { FileJson, Activity, Globe, Shield } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container flex h-16 items-center px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-terminal-amber">
            <FileJson className="h-6 w-6 text-background" />
          </div>
          <div className="flex flex-col">
            <h1 className="terminal-heading text-base leading-tight text-foreground">
              LoanJSON <span className="text-muted-foreground">//</span>{" "}
              <span className="text-terminal-amber">Terminal</span>
            </h1>
            <p className="text-[10px] terminal-text text-muted-foreground uppercase tracking-widest">
              LMA Edge // Standardized Loan Intelligence
            </p>
          </div>
        </div>

        <div className="ml-12 hidden lg:flex items-center gap-8 border-l border-border pl-8">
          <div className="flex flex-col">
            <span className="text-[9px] terminal-heading text-muted-foreground">EURIBOR 3M</span>
            <div className="flex items-center gap-2">
              <span className="terminal-number text-sm font-bold text-terminal-green">3.842%</span>
              <span className="text-[10px] text-terminal-green">▲</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] terminal-heading text-muted-foreground">STR (ESTR)</span>
            <div className="flex items-center gap-2">
              <span className="terminal-number text-sm font-bold text-terminal-green">3.651%</span>
              <span className="text-[10px] text-terminal-green">▲</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] terminal-heading text-muted-foreground">Compliance ID</span>
            <span className="terminal-number text-sm font-bold text-terminal-cyan">LMA-SEC-091</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-terminal-green/10 border border-terminal-green/30 rounded-sm">
              <Activity className="h-3 w-3 text-terminal-green animate-pulse" />
              <span className="text-[10px] terminal-heading text-terminal-green">LIVE</span>
            </div>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="flex items-center gap-4">
              <Globe className="h-4 w-4 text-muted-foreground hover:text-terminal-amber cursor-pointer transition-colors" />
              <Shield className="h-4 w-4 text-muted-foreground hover:text-terminal-cyan cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
