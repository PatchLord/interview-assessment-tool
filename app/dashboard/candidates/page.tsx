import AddCandidateButton from "@/components/add-candidate-button";
import CandidatesList from "@/components/candidates-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import Interview from "@/lib/models/interview";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";

async function getCandidates() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  // If user is admin, get all candidates
  if (session?.user?.role === "admin") {
    const candidates = await Candidate.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(candidates));
  }

  // For interviewers, only get candidates they've interviewed
  if (session?.user?.id) {
    // Find all interviews conducted by this interviewer
    const interviews = await Interview.find({
      interviewer: session.user.id,
    })
      .select("candidate")
      .lean();

    // Extract unique candidate IDs
    const candidateIds = [...new Set(interviews.map((interview) => interview.candidate))];

    // Get all these candidates
    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(candidates));
  }

  return [];
}

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <AddCandidateButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{candidates.length > 0 ? "My Candidates" : "No Candidates Found"}</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidatesList candidates={candidates} />
        </CardContent>
      </Card>
    </div>
  );
}
