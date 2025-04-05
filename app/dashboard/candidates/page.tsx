"use client";

import AddCandidateButton from "@/components/add-candidate-button";
import CandidatesList from "@/components/candidates-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/candidates");
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <AddCandidateButton onSuccess={handleRefresh} />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-gray-500 ">Loading candidates...</div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{candidates.length > 0 ? "My Candidates" : "No Candidates Found"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidatesList
              candidates={candidates}
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
