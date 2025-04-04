"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar, User } from "lucide-react"

interface Interview {
  _id: string
  candidate: {
    _id: string
    name: string
    position: string
    interviewLevel: string
  }
  interviewer: {
    _id: string
    name: string
  }
  date: string
  status: "in-progress" | "completed"
  finalAssessment?: {
    overallScore: number
  }
}

export default function InterviewsList({ interviews }: { interviews: Interview[] }) {
  return (
    <div className="space-y-4">
      {interviews.length > 0 ? (
        interviews.map((interview) => (
          <div key={interview._id} className="p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium">{interview.candidate.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={interview.candidate.position === "Intern" ? "secondary" : "default"}>
                    {interview.candidate.position}
                  </Badge>
                  <Badge variant="outline">{interview.candidate.interviewLevel} Level</Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User className="h-4 w-4 mr-1" />
                  Interviewer: {interview.interviewer.name}
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(interview.date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={interview.status === "completed" ? "success" : "secondary"}>
                    {interview.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                  {interview.status === "completed" && interview.finalAssessment && (
                    <Badge variant="outline">Score: {interview.finalAssessment.overallScore}/10</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link href={`/dashboard/interviews/${interview._id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {interview.status === "in-progress" ? "Continue Interview" : "View Details"}
                </Button>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No interviews found</p>
      )}
    </div>
  )
}

