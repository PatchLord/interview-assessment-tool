import AddCandidateButton from "@/components/add-candidate-button";
import CandidatesList from "@/components/candidates-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Candidate from "@/lib/models/candidate";
import connectToDatabase from "@/lib/mongodb";

async function getCandidates() {
  await connectToDatabase();
  const candidates = await Candidate.find().sort({ createdAt: -1 }).lean();
  // Properly serialize MongoDB objects to plain JavaScript objects
  return JSON.parse(JSON.stringify(candidates));
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
          <CardTitle>All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidatesList candidates={candidates} />
        </CardContent>
      </Card>
    </div>
  );
}
