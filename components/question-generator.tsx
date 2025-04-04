"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface QuestionGeneratorProps {
  candidateSkills: string[]
  interviewLevel: string
  onAddQuestion: (question: { skill: string; difficulty: string; question: string }) => void
}

export default function QuestionGenerator({ candidateSkills, interviewLevel, onAddQuestion }: QuestionGeneratorProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [generatedQuestion, setGeneratedQuestion] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const { toast } = useToast()

  const handleGenerateQuestion = async () => {
    if (!selectedSkill || !selectedDifficulty) {
      toast({
        title: "Error",
        description: "Please select both skill and difficulty",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedQuestion("")

    try {
      const response = await fetch("/api/ai/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: [selectedSkill],
          difficulty: selectedDifficulty,
          level: interviewLevel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate question")
      }

      const data = await response.json()
      setGeneratedQuestion(data.question)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddQuestion = () => {
    if (!generatedQuestion) {
      toast({
        title: "Error",
        description: "Please generate a question first",
        variant: "destructive",
      })
      return
    }

    onAddQuestion({
      skill: selectedSkill,
      difficulty: selectedDifficulty,
      question: generatedQuestion,
    })

    // Reset form
    setSelectedSkill("")
    setSelectedDifficulty("")
    setGeneratedQuestion("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Interview Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill">Select Skill</Label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {candidateSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Select Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuestion}
            disabled={isGenerating || !selectedSkill || !selectedDifficulty}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Question"}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedQuestion}
              onChange={(e) => setGeneratedQuestion(e.target.value)}
              className="min-h-[200px]"
            />

            <Button onClick={handleAddQuestion} className="w-full">
              Add Question to Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

