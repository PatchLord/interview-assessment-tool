import { authOptions } from "@/lib/auth";
import Interview from "@/lib/models/interview";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get a specific interview
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Properly await the interview ID parameter
    const interviewId = (await params).id;

    // Connection is already established at application startup
    const interview = await Interview.findById(interviewId)
      .populate({
        path: "candidate",
        options: { lean: true },
      })
      .populate("interviewer", "-password");

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or the interviewer
    if (
      session.user.role !== "admin" &&
      interview.interviewer?._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(interview)));
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

// Update an interview (add question, update question, complete interview)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data } = await request.json();
    if (!action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Properly await the interview ID parameter
    const interviewId = (await params).id;

    // Connection is already established at application startup
    const interview = await Interview.findById(interviewId)
      .populate({
        path: "candidate",
        options: { lean: true },
      })
      .populate("interviewer", "-password");
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Check if user is the interviewer or an admin
    const interviewerId = interview.interviewer.toString();
    const userIsInterviewer = interviewerId === session.user.id;
    const userIsAdmin = session.user.role === "admin";

    let updatedInterview;
    switch (action) {
      case "addQuestion":
        interview.questions.push(data);
        updatedInterview = await interview.save();
        break;
      case "updateQuestion":
        const { questionIndex, ...questionData } = data;
        if (interview.questions[questionIndex]) {
          Object.assign(interview.questions[questionIndex], questionData);
          updatedInterview = await interview.save();
        } else {
          return NextResponse.json(
            { error: "Question not found" },
            { status: 404 }
          );
        }
        break;
      case "completeInterview":
        interview.finalAssessment = data;
        interview.status = "completed";
        updatedInterview = await interview.save();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Return a properly serialized version of the updated interview
    return NextResponse.json(JSON.parse(JSON.stringify(updatedInterview)));
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      {
        error: "Failed to update interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
