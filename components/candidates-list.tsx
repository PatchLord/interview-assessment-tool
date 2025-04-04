"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import Link from "next/link";

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

export default function CandidatesList({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="space-y-4">
      {candidates.length > 0 ? (
        candidates.map((candidate) => (
          <div
            key={candidate._id}
            className="p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium">{candidate.name}</h3>
                <p className="text-sm text-gray-500">{candidate.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={candidate.position === "Intern" ? "secondary" : "default"}>
                    {candidate.position}
                  </Badge>
                  <Badge variant="outline">{candidate.interviewLevel} Level</Badge>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </div>
                <Link href={`/dashboard/candidates/${candidate._id}`}>
                  <Button
                    variant="outline"
                    size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Self Analysis:</p>
              <div className="flex gap-3">
                <Badge variant="outline">BE: {candidate.selfAnalysis.beScore}/10</Badge>
                <Badge variant="outline">FE: {candidate.selfAnalysis.feScore}/10</Badge>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No candidates found</p>
      )}
    </div>
  );
}
