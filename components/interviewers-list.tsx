"use client"

import { useState } from "react"
import { User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface Interviewer {
  _id: string
  name: string
  email: string
  department: string
  isActive: boolean
}

export default function InterviewersList({ interviewers: initialInterviewers }: { interviewers: Interviewer[] }) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>(initialInterviewers)
  const { toast } = useToast()

  const toggleInterviewerStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update interviewer status")
      }

      setInterviewers(
        interviewers.map((interviewer) => (interviewer._id === id ? { ...interviewer, isActive } : interviewer)),
      )

      toast({
        title: "Success",
        description: `Interviewer ${isActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interviewer status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {interviewers.length > 0 ? (
        interviewers.map((interviewer) => (
          <div key={interviewer._id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{interviewer.name}</p>
                <p className="text-sm text-gray-500">{interviewer.email}</p>
                <p className="text-xs text-gray-500">Department: {interviewer.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{interviewer.isActive ? "Active" : "Inactive"}</span>
              <Switch
                checked={interviewer.isActive}
                onCheckedChange={(checked) => toggleInterviewerStatus(interviewer._id, checked)}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No interviewers found</p>
      )}
    </div>
  )
}

