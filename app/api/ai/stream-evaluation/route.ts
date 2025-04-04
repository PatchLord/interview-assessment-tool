import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { streamEvaluation } from "@/lib/langchain"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { question, code, skills } = await request.json()

    if (!question || !code || !skills) {
      return new Response("Missing required fields", { status: 400 })
    }

    return streamEvaluation(question, code, skills)
  } catch (error) {
    return new Response("Failed to stream evaluation", { status: 500 })
  }
}

