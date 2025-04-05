"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="rounded-md border overflow-auto">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Interview Level</TableHead>
              <TableHead>Self Analysis</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow
                key={candidate._id}
                className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback className="font-semibold text-primary text-sm">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={candidate.position === "Intern" ? "secondary" : "default"}>
                    {candidate.position}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="font-normal text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge
                        variant="outline"
                        className="font-normal text-xs">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.interviewLevel}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {candidate.selfAnalysis ? (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">BE: {candidate.selfAnalysis.beScore}/10</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="font-medium">FE: {candidate.selfAnalysis.feScore}/10</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not available</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/candidates/${candidate._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 hover:text-primary">
                      <Eye className="h-3.5 w-3.5" />
                      View
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
