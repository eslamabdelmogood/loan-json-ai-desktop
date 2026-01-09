import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { content, fileName, fileType } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI configuration missing. Please connect the Gemini integration." },
        { status: 500 },
      )
    }

    // If it's already JSON, validate it against the schema
    if (fileType === "application/json" || fileName.endsWith(".json")) {
      try {
        const json = JSON.parse(content)
        // Basic schema validation
        if (json.loan_id && json.borrower && json.loan_terms) {
          return NextResponse.json({
            success: true,
            data: json,
            message: "File uploaded and analyzed successfully",
          })
        }
      } catch (e) {
        // If JSON parsing fails, treat it as text to attempt AI conversion
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    })

    const prompt = `
    You are a professional banking document processor. Convert the following loan document text into a standardized LoanJSON format.
    
    The target schema MUST include:
    - metadata: { version: "1.0", last_updated: "current_timestamp", schema_type: "LoanJSON-Standard" }
    - loan_id: string
    - borrower: { name, jurisdiction, sector, credit_rating }
    - loan_terms: { principal: { amount, currency }, interest_rate: { type, base, margin, current_all_in }, maturity_date, origination_date }
    - covenants: Array of { id, description, threshold, unit, current_value, status: "compliant" | "breached", last_check }
    - risk_engine: { health_score (0-100), trend: "stable" | "increasing" | "decreasing", prediction: { probability_of_default, horizon: "90d", factors: string[] } }
    - timeline: Array of { date, event, description, type: "origination" | "amendment" | "review" | "payment" | "breach" }

    Document Content:
    ${content}

    Return ONLY the valid JSON object. If data is missing, make conservative estimates based on sector norms but mark them clearly. Ensure the timeline is chronological.
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    try {
      const loanData = JSON.parse(text)
      return NextResponse.json({
        success: true,
        data: loanData,
        message: "File converted to LoanJSON and analyzed",
      })
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse converted loan data",
        },
        { status: 422 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Conversion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or unsupported loan document",
      },
      { status: 500 },
    )
  }
}
