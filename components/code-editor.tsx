"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Editor from "@monaco-editor/react";
import { CheckCircle2, ChevronLeft, ChevronRight, Code, FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Question {
  skill: string;
  difficulty: string;
  question: string;
  candidateCode?: string;
  interviewerNotes?: string;
}

interface CodeEditorProps {
  questions: Question[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  onUpdateQuestion: (
    index: number,
    data: { candidateCode?: string; interviewerNotes?: string }
  ) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  onUpdateQuestion,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(questions[activeQuestionIndex]?.candidateCode || "");
  const [notes, setNotes] = useState<string>(
    questions[activeQuestionIndex]?.interviewerNotes || ""
  );
  const { toast } = useToast();
  const [codeSaved, setCodeSaved] = useState<boolean>(false);
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Update local state when active question changes
  useEffect(() => {
    setCode(questions[activeQuestionIndex]?.candidateCode || "");
    setNotes(questions[activeQuestionIndex]?.interviewerNotes || "");
    setCodeSaved(false);
    setNotesSaved(false);
  }, [activeQuestionIndex, questions]);

  // Function to determine the language for syntax highlighting
  const detectLanguage = (code: string): string => {
    // Simple detection based on keywords or syntax patterns
    if (code.includes("def ") || (code.includes("import ") && code.includes(":"))) {
      return "python";
    } else if (code.includes("function") || code.includes("=>") || code.includes("const ")) {
      return "javascript";
    } else if (code.includes("public class") || code.includes("System.out.println")) {
      return "java";
    } else if (code.includes("#include") || code.includes("int main()")) {
      return "cpp";
    }

    // Default to JavaScript if we can't detect
    return "javascript";
  };

  const handleSaveCode = () => {
    onUpdateQuestion(activeQuestionIndex, { candidateCode: code });
    setCodeSaved(true);

    toast({
      title: "Success",
      description: "Code saved successfully",
    });

    // Reset the saved state after 2 seconds
    setTimeout(() => {
      setCodeSaved(false);
    }, 2000);
  };

  const handleSaveNotes = () => {
    onUpdateQuestion(activeQuestionIndex, { interviewerNotes: notes });
    setNotesSaved(true);

    toast({
      title: "Success",
      description: "Notes saved successfully",
    });

    // Reset the saved state after 2 seconds
    setTimeout(() => {
      setNotesSaved(false);
    }, 2000);
  };

  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Question Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Question Editor</h2>
          {readOnly && (
            <Badge
              variant="outline"
              className="text-yellow-600 bg-yellow-50">
              Read-only
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            disabled={activeQuestionIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm px-2">
            {activeQuestionIndex + 1} / {questions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            disabled={activeQuestionIndex >= questions.length - 1}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Question Display */}
      <Card className="overflow-hidden border rounded-lg">
        <div className="p-4 bg-muted/30">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-2">
              <Badge>{activeQuestion?.skill}</Badge>
              <Badge variant="outline">{activeQuestion?.difficulty}</Badge>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p
                    className="mb-4"
                    {...props}
                  />
                ),
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-bold mb-4"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-bold mb-3"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-bold mb-2"
                    {...props}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    className="bg-gray-800 text-white p-4 rounded-md my-4 overflow-auto"
                    {...props}
                  />
                ),
                code: ({
                  node,
                  inline,
                  ...props
                }: {
                  node?: any;
                  inline?: boolean;
                  [key: string]: any;
                }) =>
                  inline ? (
                    <code
                      className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded"
                      {...props}
                    />
                  ) : (
                    <code {...props} />
                  ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc pl-6 mb-4"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal pl-6 mb-4"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    className="mb-1"
                    {...props}
                  />
                ),
              }}>
              {activeQuestion?.question}
            </ReactMarkdown>
          </div>
        </div>
      </Card>

      {/* Code and Notes Editor */}
      <Tabs
        defaultValue="code"
        className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="code"
            className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Candidate Code
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Interviewer Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="code"
          className="space-y-4">
          {readOnly ? (
            <div className="border rounded-md p-4 bg-muted/30 min-h-[300px] font-mono whitespace-pre-wrap overflow-auto">
              {code || "No code was submitted for this question."}
            </div>
          ) : (
            <div className="relative border rounded-md">
              <div className="h-[500px] w-full">
                <Editor
                  height="500px"
                  defaultLanguage={detectLanguage(code)}
                  language={detectLanguage(code)}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    readOnly: readOnly,
                  }}
                />
              </div>

              {!readOnly && (
                <div className="flex justify-end p-2 bg-muted/10 border-t">
                  <Button
                    onClick={handleSaveCode}
                    className="flex items-center gap-2"
                    variant={codeSaved ? "outline" : "default"}>
                    {codeSaved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="notes"
          className="space-y-4">
          {readOnly ? (
            <div className="border rounded-md p-4 bg-muted/30 min-h-[300px] whitespace-pre-wrap overflow-auto">
              {notes || "No interviewer notes were recorded for this question."}
            </div>
          ) : (
            <div className="relative">
              <Textarea
                placeholder="Add your notes about the candidate's performance, approach, and communication..."
                className="min-h-[300px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-2"
                  variant={notesSaved ? "outline" : "default"}>
                  {notesSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
