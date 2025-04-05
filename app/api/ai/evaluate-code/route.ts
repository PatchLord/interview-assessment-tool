import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evaluateCode } from "@/lib/langchain";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, code, skills } = await request.json();

    if (!question || !code || !skills) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateCode(question, code, skills);

    // Try to parse the evaluation result if it's a string
    let parsedEvaluation: any = evaluation;
    try {
      if (typeof evaluation === "string") {
        // Find the JSON object in the response
        const jsonMatch = evaluation.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            evaluation: evaluation,
            parsedData: jsonData,
          });
        }
      }
    } catch (error) {
      console.error("Error parsing evaluation:", error);
      // If parsing fails, just return the original evaluation
    }

    return NextResponse.json({ evaluation: parsedEvaluation });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code" },
      { status: 500 }
    );
  }
}
