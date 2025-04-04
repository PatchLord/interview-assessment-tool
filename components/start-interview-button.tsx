"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

interface Candidate {
  _id: string
  name: string
  email: string
}

export default function StartInterviewButton() {
  const [open, setOpen] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates")
        if (!response.ok) {
          throw new Error("Failed to fetch candidates")
        }
        const data = await response.json()
        setCandidates(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch candidates",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      fetchCandidates()
    }
  }, [open, toast])

  const handleStartInterview = async () => {
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create interview")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Interview started successfully",
      })

      router.push(`/dashboard/interviews/${data._id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start interview",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Play className="h-4 w-4 mr-2" />
        Start Interview
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="candidate">Select Candidate</Label>
              {isFetching ? (
                <p className="text-sm text-gray-500">Loading candidates...</p>
              ) : (
                <Select onValueChange={setSelectedCandidate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate._id} value={candidate._id}>
                        {candidate.name} ({candidate.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartInterview} disabled={isLoading || !selectedCandidate}>
                {isLoading ? "Starting..." : "Start Interview"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

