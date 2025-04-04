import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all candidates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connection is already established at application startup
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

// Create a new candidate
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, position, skills, selfAnalysis, resumeUrl, interviewLevel } =
      await request.json();
    if (!name || !email || !position || !skills || !interviewLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connection is already established at application startup
    const newCandidate = new Candidate({
      name,
      email,
      position,
      skills,
      selfAnalysis,
      resumeUrl,
      interviewLevel,
    });
    await newCandidate.save();
    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
