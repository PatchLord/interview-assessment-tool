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
import { BarChart, Briefcase, Calendar, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Candidate {
  _id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  selfAnalysis: {
    beScore: number;
    feScore: number;
  };
  interviewLevel: string;
  createdAt: string;
}

interface CandidatesListProps {
  candidates: Candidate[];
  refreshTrigger?: number;
}

export default function CandidatesList({
  candidates: initialCandidates,
  refreshTrigger,
}: CandidatesListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  // Effect to refresh data on trigger change
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates");
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
        }
      } catch (error) {
        console.error("Failed to refresh candidates:", error);
      }
    };

    if (typeof window !== "undefined" && refreshTrigger) {
      fetchCandidates();
    }
  }, [refreshTrigger]);

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
          <Star className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No candidates found</h3>
        <p className="text-gray-500 max-w-md">
          There are no candidates to display. Add a new candidate to get started with interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <Card
          key={candidate._id}
          className="overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/50">
          <CardHeader className="py-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="font-semibold text-primary">
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <CardDescription className="text-xs truncate max-w-[200px]">
                    {candidate.email}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={candidate.position === "Intern" ? "secondary" : "default"}
                className="ml-2 whitespace-nowrap">
                {candidate.position}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2 flex-1">
            <div className="flex flex-wrap gap-1.5 mb-3 mt-1">
              {candidate.skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="font-normal text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="font-normal text-xs">
                  +{candidate.skills.length - 4}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Interview Level:</span>
              </div>
              <div className="font-medium">{candidate.interviewLevel}</div>

              {candidate.selfAnalysis && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Self Analysis:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">BE: {candidate.selfAnalysis.beScore}/10</span>
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="font-medium">FE: {candidate.selfAnalysis.feScore}/10</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex  justify-between items-center pt-2 text-xs text-muted-foreground border-t mt-2">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {new Date(candidate.createdAt).toLocaleDateString()}
            </div>
            <Link href={`/dashboard/candidates/${candidate._id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 hover:text-primary">
                <Eye className="h-3.5 w-3.5" />
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
