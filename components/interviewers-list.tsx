"use client";

import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

interface Interviewer {
  _id: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

interface InterviewersListProps {
  interviewers: Interviewer[];
  refreshTrigger?: number;
}

export default function InterviewersList({
  interviewers: initialInterviewers,
  refreshTrigger,
}: InterviewersListProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>(initialInterviewers);
  const { toast } = useToast();

  // This effect will run whenever refreshTrigger changes, forcing a refresh of data
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setInterviewers(data);
        }
      } catch (error) {
        console.error("Failed to refresh interviewers:", error);
      }
    };

    // Only fetch if we're in the browser and have a refreshTrigger
    if (typeof window !== "undefined" && refreshTrigger) {
      fetchInterviewers();
    }
  }, [refreshTrigger]);

  const toggleInterviewerStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update interviewer status");
      }

      setInterviewers(
        interviewers.map((interviewer) =>
          interviewer._id === id ? { ...interviewer, isActive } : interviewer
        )
      );

      toast({
        title: "Success",
        description: `Interviewer ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interviewer status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {interviewers.length > 0 ? (
        interviewers.map((interviewer) => (
          <div
            key={interviewer._id}
            className="flex items-center justify-between p-4 border rounded-lg">
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
              <span className="text-sm text-gray-500">
                {interviewer.isActive ? "Active" : "Inactive"}
              </span>
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
  );
}
