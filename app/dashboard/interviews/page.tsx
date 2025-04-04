import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import connectToDatabase from "@/lib/mongodb"
import Interview from "@/lib/models/interview"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import InterviewsList from "@/components/interviews-list"
import StartInterviewButton from "@/components/start-interview-button"

async function getInterviews() {
  await connectToDatabase()
  const session = await getServerSession(authOptions)

  // If admin, get all interviews, otherwise get only interviews conducted by the user
  const query = session?.user?.role === "admin" ? {} : { interviewer: session?.user?.id }

  return Interview.find(query).populate("candidate").populate("interviewer", "-password").sort({ date: -1 }).lean()
}

export default async function InterviewsPage() {
  const interviews = await getInterviews()

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
  )
}

