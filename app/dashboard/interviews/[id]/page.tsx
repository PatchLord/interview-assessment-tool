import InterviewSession from "@/components/interview-session";
import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import Interview from "@/lib/models/interview";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

// Helper functions remain unchanged
async function getInterview(id: string) {
  // Skip database query if we're on the "new" route
  if (id === "new") {
    return null;
  }

  // Ensure database connection is established
  await connectToDatabase();

  try {
    const interview = await Interview.findById(id)
      .populate("candidate")
      .populate("interviewer", "-password");

    if (!interview) {
      return null;
    }

    // Properly serialize the MongoDB objects to plain objects
    return JSON.parse(JSON.stringify(interview));
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

async function createNewInterview(candidateId: string, userId: string) {
  try {
    // Ensure database connection is established
    await connectToDatabase();

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Create new interview
    const newInterview = new Interview({
      candidate: candidateId,
      interviewer: userId,
      questions: [],
      status: "in-progress",
    });

    await newInterview.save();
    return newInterview._id.toString();
  } catch (error) {
    console.error("Error creating new interview:", error);
    throw error;
  }
}

// Main page component that awaits the params
export default async function InterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params and extract values
  const id = (await params).id;

  // Extract candidateId safely
  const candidateId = (await searchParams).candidateId as string;

  // Continue with the rest of the component logic
  return await renderInterviewContent(id, candidateId);
}

// This helper function handles the actual content rendering
async function renderInterviewContent(id: string, candidateId?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  // Handle "new" route
  if (id === "new") {
    if (!candidateId) {
      return redirect("/dashboard/candidates");
    }

    try {
      const newInterviewId = await createNewInterview(candidateId, session.user.id);
      return redirect(`/dashboard/interviews/${newInterviewId}`);
    } catch (error) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">Failed to create new interview. Please try again.</p>
        </div>
      );
    }
  }

  const interview = await getInterview(id);

  if (!interview) {
    notFound();
  }

  if (session.user.role !== "admin" && interview.interviewer._id !== session.user.id) {
    notFound();
  }

  return <InterviewSession interview={interview} />;
}
