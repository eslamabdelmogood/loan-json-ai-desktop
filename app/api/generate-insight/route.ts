import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { loanData, insightType, currentInsight } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "API key not configured. Please set GEMINI_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Create prompts based on insight type
    let prompt = ""
    const systemContext = `You are a conservative banking analyst providing clear, non-technical, regulator-friendly analysis. 
    Base your analysis only on the provided loan data. Do not hallucinate or speculate. 
    Use professional banking terminology but explain concepts clearly for a broad audience.`

    const loanSummary = `
    Loan ID: ${loanData.loan_id}
    Borrower: ${loanData.borrower.name} (${loanData.borrower.sector}, ${loanData.borrower.credit_rating})
    Principal: ${loanData.loan_terms.principal.amount} ${loanData.loan_terms.principal.currency}
    Interest Rate: ${loanData.loan_terms.interest_rate.current_all_in}% (${loanData.loan_terms.interest_rate.type})
    Maturity: ${loanData.loan_terms.maturity_date}
    Health Score: ${loanData.risk_engine.health_score}/100 (${loanData.risk_engine.trend})
    Probability of Default (90d): ${(loanData.risk_engine.prediction.probability_of_default * 100).toFixed(1)}%
    Covenants: ${loanData.covenants.length} total, ${loanData.covenants.filter((c: any) => c.status === "breached").length} breached
    Covenant Breaches: ${loanData.covenants
      .filter((c: any) => c.status === "breached")
      .map((c: any) => `${c.description} (Current: ${c.current_value}${c.unit}, Threshold: ${c.threshold}${c.unit})`)
      .join("; ")}
    `

    switch (insightType) {
      case "explain":
        prompt = `${systemContext}

Provide a comprehensive explanation of this loan for banking professionals. Structure your response with these sections:

Loan Data:
${loanSummary}

Provide:
1. Loan Overview: Summarize the key terms and structure
2. Current Status: Explain the current state of the loan
3. Performance Metrics: Interpret the health score and default probability
4. Key Considerations: Highlight important factors for bank management

Keep the tone professional and conservative. Be concise but thorough.`
        break

      case "risk":
        prompt = `${systemContext}

Provide a risk analysis of this loan for banking professionals. Structure your response with these sections:

Loan Data:
${loanSummary}

Risk Factors: ${loanData.risk_engine.prediction.factors.join(", ")}

Provide:
1. Risk Assessment: Evaluate the overall risk profile
2. Covenant Analysis: Analyze the covenant breach and its implications
3. Default Probability: Interpret the 90-day default probability
4. Mitigation Strategies: Suggest conservative risk mitigation approaches

Focus on concrete risk factors from the data. Avoid speculation.`
        break

      case "esg":
        prompt = `${systemContext}

Provide an ESG (Environmental, Social, Governance) impact assessment for this loan.

Loan Data:
${loanSummary}

Based on the borrower sector (${loanData.borrower.sector}) and available data, provide:
1. ESG Considerations: Relevant ESG factors for this sector
2. Performance Indicators: How operational metrics (like uptime) relate to ESG
3. Governance Assessment: Evaluate governance based on covenant compliance
4. ESG Risk Factors: Identify potential ESG-related risks

Be conservative and base analysis on sector norms and the provided data.`
        break

      case "summary-voice":
        prompt = `${systemContext}
        
Based on the following loan analysis, generate a short, professional, executive-level summary suitable for text-to-speech. 
The summary should be approximately 10-20 seconds when spoken (roughly 40-60 words).
Focus on high-level risk and performance. Do not read raw numbers, table data, or JSON keys.
Keep it calm and regulator-friendly.

Analysis:
${currentInsight || "No analysis provided"}

Loan Context:
${loanSummary}`
        break

      default:
        return NextResponse.json({ error: "Invalid insight type" }, { status: 400 })
    }

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the response into structured sections
    const sections = text
      .split(/\n\n+/)
      .map((paragraph) => {
        const lines = paragraph.split("\n")
        const firstLine = lines[0].replace(/^[#*\s]+/, "").trim()

        // Check if first line looks like a heading (short and possibly with markers)
        const isHeading = firstLine.length < 80 && (firstLine.match(/^[A-Z]/) || lines.length > 1)

        if (isHeading && lines.length > 1) {
          return {
            heading: firstLine.replace(/[:：]$/, ""),
            content: lines.slice(1).join(" ").trim(),
          }
        } else {
          return {
            heading: "",
            content: paragraph.trim(),
          }
        }
      })
      .filter((section) => section.content)

    // Extract recommendations if present
    const recommendationSection = sections.find(
      (s) => s.heading.toLowerCase().includes("recommendation") || s.heading.toLowerCase().includes("mitigation"),
    )

    const recommendations = recommendationSection
      ? recommendationSection.content
          .split(/[•\-*]\s+/)
          .slice(1)
          .map((r) => r.trim())
          .filter((r) => r.length > 10)
      : []

    const insightTitles: Record<string, { title: string; subtitle: string }> = {
      explain: {
        title: "Loan Explanation",
        subtitle: "Comprehensive overview of loan structure and current status",
      },
      risk: {
        title: "Risk Analysis",
        subtitle: "Detailed assessment of risk factors and mitigation strategies",
      },
      esg: {
        title: "ESG Impact Assessment",
        subtitle: "Environmental, Social, and Governance considerations",
      },
      "summary-voice": {
        title: "Executive Summary",
        subtitle: "Professional summary suitable for text-to-speech",
      },
    }

    return NextResponse.json({
      ...insightTitles[insightType],
      sections: sections.filter((s) => !s.heading.toLowerCase().includes("recommendation")),
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      rawText: text,
    })
  } catch (error: any) {
    console.error("Error generating insight:", error)
    return NextResponse.json(
      {
        error: "Failed to generate AI insight. Please check your API configuration.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
