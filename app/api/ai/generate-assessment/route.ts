import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateFinalAssessment } from "@/lib/langchain"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, position, skills, questionEvaluations } = await request.json()

    if (!name || !position || !skills || !questionEvaluations) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const assessment = await generateFinalAssessment(name, position, skills, questionEvaluations)

    return NextResponse.json({ assessment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate assessment" }, { status: 500 })
  }
}

