"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Building, CheckCircle, Mail, User, XCircle } from "lucide-react";
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

  if (interviewers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No interviewers found</h3>
        <p className="text-gray-500 max-w-md">
          There are no interviewers to display. Add a new interviewer to start conducting
          interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {interviewers.map((interviewer) => (
        <Card
          key={interviewer._id}
          className={`overflow-hidden transition-all hover:shadow-md ${
            interviewer.isActive ? "hover:border-primary/50" : "hover:border-gray-300 opacity-75"
          }`}>
          <CardHeader className="py-4 relative">
            <div className="absolute right-4 top-5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        checked={interviewer.isActive}
                        onCheckedChange={(checked) =>
                          toggleInterviewerStatus(interviewer._id, checked)
                        }
                        aria-label={`${
                          interviewer.isActive ? "Deactivate" : "Activate"
                        } interviewer account`}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{interviewer.isActive ? "Deactivate" : "Activate"} interviewer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback className="font-semibold text-primary">
                  {interviewer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {interviewer.name}
                  {interviewer.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs truncate max-w-[200px]">
                  {interviewer.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground mr-2">Department:</span>
                <span className="font-medium">{interviewer.department}</span>
              </div>

              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                <a
                  href={`mailto:${interviewer.email}`}
                  className="text-primary hover:underline truncate">
                  {interviewer.email}
                </a>
              </div>

              <div className="mt-2 flex items-center text-sm">
                <Badge
                  variant={interviewer.isActive ? "success" : "secondary"}
                  className="gap-1 text-xs">
                  {interviewer.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
