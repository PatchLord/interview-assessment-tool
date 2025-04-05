import { generateFollowUpQuestions } from "@/lib/langchain";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { question, code, evaluation, skills } = await req.json();

    if (!question || !code || !skills) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateFollowUpQuestions(
      question,
      code,
      evaluation || "",
      skills
    );

    // Try to parse the result as JSON
    try {
      console.log("result", result);

      // Check if the result is wrapped in markdown code blocks
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonString = result;

      if (jsonMatch && jsonMatch[1]) {
        // Extract the JSON from the markdown code block
        jsonString = jsonMatch[1];
      }

      const parsedData = JSON.parse(jsonString);
      console.log("parsedData", parsedData);

      return NextResponse.json({
        followUpQuestions: parsedData.followUpQuestions,
        raw: result,
      });
    } catch (parseError) {
      console.error("Error parsing follow-up questions:", parseError);
      // Return the raw result if parsing fails
      return NextResponse.json({ raw: result });
    }
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up questions" },
      { status: 500 }
    );
  }
}
