"use client";

import AddInterviewerForm from "@/components/add-interviewer-form";
import InterviewersList from "@/components/interviewers-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function InterviewersPage() {
  const [open, setOpen] = useState(false);
  const [interviewers, setInterviewers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setInterviewers(data);
        }
      } catch (error) {
        console.error("Failed to fetch interviewers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewers();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Interviewers</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Interviewer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {interviewers.length > 0 ? "All Interviewers" : "No Interviewers Found"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-gray-500">Loading interviewers...</div>
            </div>
          ) : (
            <InterviewersList
              interviewers={interviewers}
              refreshTrigger={refreshTrigger}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Interviewer</DialogTitle>
          </DialogHeader>
          <AddInterviewerForm onSuccess={handleRefresh} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
