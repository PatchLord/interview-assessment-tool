import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import Interview from "@/lib/models/interview"; // Add import for Interview model
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all candidates (filtered by role)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // If user is admin, return all candidates
    if (session.user.role === "admin") {
      const candidates = await Candidate.find().sort({ createdAt: -1 });
      return NextResponse.json(candidates);
    }

    // For interviewers, only return candidates they've interviewed
    if (session.user.id) {
      // Find all interviews conducted by this interviewer
      const interviews = await Interview.find({
        interviewer: session.user.id,
      })
        .select("candidate")
        .lean();

      // Extract unique candidate IDs
      const candidateIds = [...new Set(interviews.map((interview) => interview.candidate))];

      // Get only those candidates
      const candidates = await Candidate.find({
        _id: { $in: candidateIds },
      }).sort({ createdAt: -1 });

      return NextResponse.json(candidates);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching candidates:", error);
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
