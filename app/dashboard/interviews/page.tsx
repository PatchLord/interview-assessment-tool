import InterviewsList from "@/components/interviews-list";
import StartInterviewButton from "@/components/start-interview-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate"; // Import Candidate model
import Interview from "@/lib/models/interview";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";

async function getInterviews() {
  await connectToDatabase();

  // Ensure Candidate model is registered before populating
  // This line doesn't do anything directly, but ensures the model is loaded
  await Candidate.findOne()
    .exec()
    .catch(() => null);

  const session = await getServerSession(authOptions);

  // If admin, get all interviews, otherwise get only interviews conducted by the user
  const query = session?.user?.role === "admin" ? {} : { interviewer: session?.user?.id };

  const interviews = await Interview.find(query)
    .populate("candidate")
    .populate("interviewer", "-password")
    .sort({ date: -1 })
    .lean();

  // Properly serialize MongoDB objects to plain JavaScript objects
  return JSON.parse(JSON.stringify(interviews));
}

export default async function InterviewsPage() {
  const interviews = await getInterviews();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <StartInterviewButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewsList interviews={interviews} />
        </CardContent>
      </Card>
    </div>
  );
}
