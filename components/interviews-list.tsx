"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="rounded-md border overflow-auto">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow
                key={interview._id}
                className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback className="font-semibold text-primary text-sm">
                        {interview.candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{interview.candidate.name}</div>
                      <div className="flex items-center mt-1 gap-2">
                        <Badge
                          variant="outline"
                          className="font-normal text-xs">
                          {interview.candidate.position}
                        </Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {interview.candidate.interviewLevel} Level
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{interview.interviewer?.name || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(interview.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
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
                    <div className="mt-2 w-28">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Score</span>
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
                </TableCell>
                <TableCell>
                  {interview.questions.length > 0 ? (
                    <div className="w-36">
                      <div className="text-sm text-muted-foreground mb-1">Questions:</div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (interview.questions.filter((q) => q.candidateCode).length /
                              interview.questions.length) *
                            100
                          }
                          className="h-2 flex-1"
                        />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {interview.questions.filter((q) => q.candidateCode).length}/
                          {interview.questions.length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No questions added</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/interviews/${interview._id}`}>
                    <Button
                      variant={interview.status === "completed" ? "outline" : "default"}
                      size="sm"
                      className="gap-1 whitespace-nowrap">
                      {interview.status === "in-progress" ? (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Details
                          <Eye className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
