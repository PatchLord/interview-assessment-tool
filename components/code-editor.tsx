"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Question {
  skill: string
  difficulty: string
  question: string
  candidateCode?: string
  interviewerNotes?: string
}

interface CodeEditorProps {
  questions: Question[]
  activeQuestionIndex: number
  setActiveQuestionIndex: (index: number) => void
  onUpdateQuestion: (index: number, data: { candidateCode?: string; interviewerNotes?: string }) => void
}

export default function CodeEditor({
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  onUpdateQuestion,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(questions[activeQuestionIndex]?.candidateCode || "")
  const [notes, setNotes] = useState<string>(questions[activeQuestionIndex]?.interviewerNotes || "")

  // Update local state when active question changes
  useEffect(() => {
    setCode(questions[activeQuestionIndex]?.candidateCode || "")
    setNotes(questions[activeQuestionIndex]?.interviewerNotes || "")
  }, [activeQuestionIndex, questions])

  const handleSaveCode = () => {
    onUpdateQuestion(activeQuestionIndex, { candidateCode: code })
  }

  const handleSaveNotes = () => {
    onUpdateQuestion(activeQuestionIndex, { interviewerNotes: notes })
  }

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Code Editor</CardTitle>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Badge>{questions[activeQuestionIndex].skill}</Badge>
              <Badge variant="outline">{questions[activeQuestionIndex].difficulty}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={handlePreviousQuestion} disabled={activeQuestionIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Question
              </Button>
              <span className="text-sm text-gray-500">
                Question {activeQuestionIndex + 1} of {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                disabled={activeQuestionIndex === questions.length - 1}
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          <Tabs defaultValue="question">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="question" className="space-y-4">
              <div className="p-4 border rounded-md whitespace-pre-wrap">{questions[activeQuestionIndex].question}</div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono"
                placeholder="Write or paste candidate's code here..."
              />
              <Button onClick={handleSaveCode} className="w-full">
                Save Code
              </Button>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px]"
                placeholder="Add your notes about the candidate's approach and communication..."
              />
              <Button onClick={handleSaveNotes} className="w-full">
                Save Notes
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

