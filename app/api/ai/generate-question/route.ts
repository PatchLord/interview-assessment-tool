import { authOptions } from "@/lib/auth";
import { generateQuestion } from "@/lib/langchain";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skills, difficulty, level, format } = await request.json();
    if (!skills || !difficulty || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not defined in environment variables");
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Pass the format parameter to the generateQuestion function
    const question = await generateQuestion(skills, difficulty, level, format || "text");
    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error in generate-question route:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to generate question",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
