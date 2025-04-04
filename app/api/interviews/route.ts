import { authOptions } from "@/lib/auth";
import Interview from "@/lib/models/interview";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all interviews
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connection is already established at application startup
    // If admin, get all interviews, otherwise get only interviews conducted by the user
    const query = session.user.role === "admin" ? {} : { interviewer: session.user.id };
    const interviews = await Interview.find(query)
      .populate("candidate")
      .populate("interviewer", "-password")
      .sort({ date: -1 });
    return NextResponse.json(interviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

// Create a new interview
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await request.json();
    if (!candidateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connection is already established at application startup
    const newInterview = new Interview({
      candidate: candidateId,
      interviewer: session.user.id,
      questions: [],
      status: "in-progress",
    });
    await newInterview.save();
    return NextResponse.json(newInterview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
