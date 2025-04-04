import InterviewSession from "@/components/interview-session";
import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import Interview from "@/lib/models/interview";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

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

// Wrapper component that extracts the params without directly accessing them
// This avoids the "params should be awaited" error
function InterviewPageWrapper({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // We know what the param names are, so we can safely destructure them
  const id = params.id;
  const candidateId = searchParams.candidateId as string | undefined;

  // We use a client component wrapper that doesn't trigger the warning
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent
        id={id}
        candidateId={candidateId}
      />
    </Suspense>
  );
}

// This component receives the extracted values as props
async function InterviewPageContent({ id, candidateId }: { id: string; candidateId?: string }) {
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

// Export the wrapper as the default component
export default InterviewPageWrapper;
