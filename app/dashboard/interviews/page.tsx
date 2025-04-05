"use client";

import InterviewsList from "@/components/interviews-list";
import StartInterviewButton from "@/components/start-interview-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          setInterviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <StartInterviewButton onSuccess={handleRefresh} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{interviews.length > 0 ? "All Interviews" : "No Interviews Found"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-gray-500">Loading interviews...</div>
            </div>
          ) : (
            <InterviewsList
              interviews={interviews}
              refreshTrigger={refreshTrigger}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
