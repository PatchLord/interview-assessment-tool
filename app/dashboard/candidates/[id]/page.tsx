import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText } from "lucide-react"
import connectToDatabase from "@/lib/mongodb"
import Candidate from "@/lib/models/candidate"
import Interview from "@/lib/models/interview"
import Link from "next/link"

async function getCandidate(id: string) {
  await connectToDatabase()

  const candidate = await Candidate.findById(id)

  if (!candidate) {
    return null
  }

  return JSON.parse(JSON.stringify(candidate))
}

async function getCandidateInterviews(candidateId: string) {
  await connectToDatabase()

  const interviews = await Interview.find({ candidate: candidateId })
    .populate("interviewer", "-password")
    .sort({ date: -1 })

  return JSON.parse(JSON.stringify(interviews))
}

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidate(params.id)

  if (!candidate) {
    notFound()
  }

  const interviews = await getCandidateInterviews(params.id)

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
                  <p>{candidate.selfAnalysis}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {candidate.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
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
                      className="flex items-center text-primary hover:underline"
                    >
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
                    <div key={interview._id} className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">Interviewed on {new Date(interview.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">Interviewer: {interview.interviewer.name}</p>
                        </div>

                        <div className="mt-4 md:mt-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant={interview.status === "completed" ? "success" : "secondary"}>
                              {interview.status === "completed" ? "Completed" : "In Progress"}
                            </Badge>
                            {interview.status === "completed" && interview.finalAssessment && (
                              <Badge variant="outline">Score: {interview.finalAssessment.overallScore}/10</Badge>
                            )}
                          </div>

                          <Link href={`/dashboard/interviews/${interview._id}`}>
                            <Button variant="outline" size="sm" className="mt-2">
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
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
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
  )
}

