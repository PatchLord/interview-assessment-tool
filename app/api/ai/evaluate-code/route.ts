import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { evaluateCode } from "@/lib/langchain"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question, code, skills } = await request.json()

    if (!question || !code || !skills) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const evaluation = await evaluateCode(question, code, skills)

    return NextResponse.json({ evaluation })
  } catch (error) {
    return NextResponse.json({ error: "Failed to evaluate code" }, { status: 500 })
  }
}

