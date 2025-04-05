import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import Candidate from "@/lib/models/candidate";
import Interview from "@/lib/models/interview";
import connectToDatabase from "@/lib/mongodb";
import { ExternalLink, FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

async function getCandidate(id: string) {
  await connectToDatabase();
  const candidate = await Candidate.findById(id).lean();
  if (!candidate) {
    return null;
  }
  return JSON.parse(JSON.stringify(candidate));
}

async function getCandidateInterviews(candidateId: string, userId?: string, isAdmin?: boolean) {
  await connectToDatabase();

  // If user is admin, get all interviews for this candidate
  if (isAdmin) {
    const interviews = await Interview.find({ candidate: candidateId })
      .populate("interviewer", "-password")
      .sort({ date: -1 });
    return JSON.parse(JSON.stringify(interviews));
  }

  // For interviewers, only get interviews they conducted
  if (userId) {
    const interviews = await Interview.find({
      candidate: candidateId,
      interviewer: userId,
    })
      .populate("interviewer", "-password")
      .sort({ date: -1 });
    return JSON.parse(JSON.stringify(interviews));
  }

  return [];
}

// Check if interviewer has access to this candidate
async function hasAccessToCandidate(candidateId: string, userId: string) {
  await connectToDatabase();

  const interview = await Interview.findOne({
    candidate: candidateId,
    interviewer: userId,
  });

  return interview !== null;
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/login");
  }

  const candidateId = (await params).id;
  const candidate = await getCandidate(candidateId);

  if (!candidate) {
    notFound();
  }

  const isAdmin = session.user.role === "admin";

  // If not admin, check if interviewer has access to this candidate
  if (!isAdmin) {
    const hasAccess = await hasAccessToCandidate(candidateId, session.user.id);
    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to view this candidate.</p>
          <Link
            href="/dashboard/candidates"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Return to Candidates
          </Link>
        </div>
      );
    }
  }

  const interviews = await getCandidateInterviews(candidateId, session.user.id, isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{candidate.name}</h1>
        <Link href="/dashboard/candidates">
          <Button variant="outline">Back to Candidates</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p>{candidate.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Interview Level</p>
                  <p>{candidate.interviewLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Self Analysis</p>
                  <div className="flex gap-3 mt-1">
                    {candidate.selfAnalysis ? (
                      <>
                        <Badge variant="outline">BE: {candidate.selfAnalysis?.beScore}/10</Badge>
                        <Badge variant="outline">FE: {candidate.selfAnalysis?.feScore}/10</Badge>
                      </>
                    ) : (
                      <span className="text-gray-500">No self analysis data available</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {candidate.skills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                {candidate.resumeUrl && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">Resume</p>
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
            </CardHeader>
            <CardContent>
              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview: any) => (
                    <div
                      key={interview._id}
                      className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">
                            Interviewed on {new Date(interview.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Interviewer: {interview.interviewer?.name || "N/A"}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={interview.status === "completed" ? "success" : "secondary"}>
                              {interview.status === "completed" ? "Completed" : "In Progress"}
                            </Badge>
                            {interview.status === "completed" && interview.finalAssessment && (
                              <Badge variant="outline">
                                Score: {interview.finalAssessment.overallScore}/10
                              </Badge>
                            )}
                          </div>
                          <Link href={`/dashboard/interviews/${interview._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No interviews found for this candidate</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/dashboard/interviews/new?candidateId=${candidate._id}`}>
                <Button className="w-full">Start New Interview</Button>
              </Link>
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
