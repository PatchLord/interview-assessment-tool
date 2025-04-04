import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, UserIcon, FileTextIcon, CheckCircleIcon } from "lucide-react"
import connectToDatabase from "@/lib/mongodb"
import Interview from "@/lib/models/interview"
import Candidate from "@/lib/models/candidate"
import User from "@/lib/models/user"

async function getStats() {
  await connectToDatabase()

  const totalInterviews = await Interview.countDocuments()
  const completedInterviews = await Interview.countDocuments({ status: "completed" })
  const totalCandidates = await Candidate.countDocuments()
  const totalInterviewers = await User.countDocuments({ role: "interviewer" })

  const recentInterviews = await Interview.find()
    .populate("candidate")
    .populate("interviewer", "-password")
    .sort({ date: -1 })
    .limit(5)

  return {
    totalInterviews,
    completedInterviews,
    totalCandidates,
    totalInterviewers,
    recentInterviews,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const { totalInterviews, completedInterviews, totalCandidates, totalInterviewers, recentInterviews } =
    await getStats()

  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Interviews</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedInterviews}</div>
            <p className="text-xs text-gray-500">
              {totalInterviews > 0
                ? `${Math.round((completedInterviews / totalInterviews) * 100)}% completion rate`
                : "0% completion rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <UserIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Interviewers</CardTitle>
              <FileTextIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterviewers}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInterviews.length > 0 ? (
              recentInterviews.map((interview) => (
                <div key={interview._id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{interview.candidate.name}</p>
                    <p className="text-sm text-gray-500">
                      Interviewed by {interview.interviewer.name} on {new Date(interview.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      interview.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {interview.status === "completed" ? "Completed" : "In Progress"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent interviews</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

