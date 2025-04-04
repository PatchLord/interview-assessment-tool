"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Question {
  skill: string
  difficulty: string
  question: string
  candidateCode?: string
  aiEvaluation?: {
    codeQuality: number
    efficiency: number
    correctness: number
    logicalThinking: number
    technicalSkill: number
    problemUnderstanding: number
    feedback: string
  }
}

interface AIEvaluationProps {
  question: Question
  candidateSkills: string[]
  questionIndex: number
  onUpdateQuestion: (index: number, data: any) => void
}

export default function AIEvaluation({
  question,
  candidateSkills,
  questionIndex,
  onUpdateQuestion,
}: AIEvaluationProps) {
  const [evaluation, setEvaluation] = useState<string>(question.aiEvaluation?.feedback || "")
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const { toast } = useToast()

  const handleGenerateEvaluation = async () => {
    if (!question.candidateCode) {
      toast({
        title: "Error",
        description: "No code to evaluate",
        variant: "destructive",
      })
      return
    }

    setIsEvaluating(true)

    try {
      const response = await fetch("/api/ai/evaluate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.question,
          code: question.candidateCode,
          skills: [question.skill],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate code")
      }

      const data = await response.json()
      setEvaluation(data.evaluation)

      // Parse the evaluation to extract scores
      // This is a simplified parsing logic - in a real app, you might want to use a more robust approach
      const scores = {
        codeQuality: extractScore(data.evaluation, "Code Quality"),
        efficiency: extractScore(data.evaluation, "Efficiency"),
        correctness: extractScore(data.evaluation, "Correctness"),
        logicalThinking: extractScore(data.evaluation, "Logical Thinking"),
        technicalSkill: extractScore(data.evaluation, "Technical Skill"),
        problemUnderstanding: extractScore(data.evaluation, "Problem Understanding"),
        feedback: data.evaluation,
      }

      // Update the question with the evaluation
      onUpdateQuestion(questionIndex, { aiEvaluation: scores })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate code",
        variant: "destructive",
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  // Helper function to extract scores from the evaluation text
  const extractScore = (text: string, category: string): number => {
    const regex = new RegExp(`${category}[^0-9]*([0-9]+)`, "i")
    const match = text.match(regex)
    return match ? Number.parseInt(match[1], 10) : 5 // Default to 5 if not found
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Code Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium mb-2">Question:</h3>
            <div className="whitespace-pre-wrap mb-4">{question.question}</div>

            <h3 className="font-medium mb-2">Candidate's Code:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
              <code>{question.candidateCode}</code>
            </pre>
          </div>

          <Button
            onClick={handleGenerateEvaluation}
            disabled={isEvaluating || !question.candidateCode}
            className="w-full"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              "Generate AI Evaluation"
            )}
          </Button>

          {(evaluation || question.aiEvaluation?.feedback) && (
            <div className="space-y-4">
              <h3 className="font-medium">Evaluation:</h3>
              <Textarea
                value={evaluation || question.aiEvaluation?.feedback || ""}
                readOnly
                className="min-h-[300px]"
              />

              {question.aiEvaluation && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ScoreCard title="Code Quality" score={question.aiEvaluation.codeQuality} />
                  <ScoreCard title="Efficiency" score={question.aiEvaluation.efficiency} />
                  <ScoreCard title="Correctness" score={question.aiEvaluation.correctness} />
                  <ScoreCard title="Logical Thinking" score={question.aiEvaluation.logicalThinking} />
                  <ScoreCard title="Technical Skill" score={question.aiEvaluation.technicalSkill} />
                  <ScoreCard title="Problem Understanding" score={question.aiEvaluation.problemUnderstanding} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <div className="p-3 border rounded-md">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex items-center mt-1">
        <div className="text-2xl font-bold">{score}</div>
        <div className="text-sm text-gray-500 ml-1">/10</div>
      </div>
    </div>
  )
}

