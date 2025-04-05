"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowRight, Calendar, Check, Clock, Eye, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Interview {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    position: string;
    interviewLevel: string;
  };
  interviewer: {
    _id: string;
    name: string;
  };
  date: string;
  status: "in-progress" | "completed";
  questions: any[];
  finalAssessment?: {
    overallScore: number;
  };
}

interface InterviewsListProps {
  interviews: Interview[];
  refreshTrigger?: number;
}

export default function InterviewsList({
  interviews: initialInterviews,
  refreshTrigger,
}: InterviewsListProps) {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);

  // Effect for refreshing data
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const data = await response.json();
          setInterviews(data);
        }
      } catch (error) {
        console.error("Failed to refresh interviews:", error);
      }
    };

    if (typeof window !== "undefined" && refreshTrigger) {
      fetchInterviews();
    }
  }, [refreshTrigger]);

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No interviews found</h3>
        <p className="text-gray-500 max-w-md">
          There are no interviews to display. Start a new interview with a candidate to begin the
          process.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {interviews.map((interview) => (
        <Card
          key={interview._id}
          className={`overflow-hidden transition-all hover:shadow-md ${
            interview.status === "completed" ? "hover:border-green-200" : "hover:border-blue-200"
          }`}>
          <CardHeader className="py-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="font-semibold text-primary">
                    {interview.candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{interview.candidate.name}</CardTitle>
                  <CardDescription className="text-xs">
                    <div className="flex items-center mt-1 gap-2">
                      <Badge
                        variant="outline"
                        className="font-normal text-xs">
                        {interview.candidate.position}
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <Badge
                        variant="outline"
                        className="font-normal text-xs">
                        {interview.candidate.interviewLevel} Level
                      </Badge>
                    </div>
                  </CardDescription>
                </div>
              </div>

              <div>
                <Badge
                  variant={interview.status === "completed" ? "success" : "secondary"}
                  className="gap-1">
                  {interview.status === "completed" ? (
                    <>
                      <Check className="h-3 w-3" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      In Progress
                    </>
                  )}
                </Badge>

                {interview.status === "completed" && interview.finalAssessment && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Overall Score</span>
                      <span className="font-medium">
                        {interview.finalAssessment.overallScore}/10
                      </span>
                    </div>
                    <Progress
                      value={interview.finalAssessment.overallScore * 10}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="py-2 px-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="md:flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span>Interviewer:</span>
                  <span className="font-medium text-foreground">
                    {interview.interviewer?.name || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date:</span>
                  <span className="font-medium text-foreground">
                    {new Date(interview.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="md:flex-1">
                {interview.questions.length > 0 ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Questions Progress:</div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (interview.questions.filter((q) => q.candidateCode).length /
                            interview.questions.length) *
                          100
                        }
                        className="h-2 flex-1"
                      />
                      <span className="text-xs font-medium">
                        {interview.questions.filter((q) => q.candidateCode).length}/
                        {interview.questions.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No questions added yet</div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-4 border-t mt-2">
            <Link href={`/dashboard/interviews/${interview._id}`}>
              <Button
                variant={interview.status === "completed" ? "outline" : "default"}
                size="sm"
                className="gap-1">
                {interview.status === "in-progress" ? (
                  <>
                    Continue Interview
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    View Details
                    <Eye className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
