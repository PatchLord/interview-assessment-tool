"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface FormData {
  name: string
  email: string
  position: "Intern" | "Full-Time"
  skills: string[]
  selfAnalysis: string
  resumeUrl: string
  interviewLevel: "High" | "Mid" | "Low"
}

const SKILLS = [
  "React.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "GraphQL",
  "PostgreSQL",
  "AWS",
  "Shopify",
  "Tailwind",
  "React Native",
  "Nest.js",
]

const SELF_ANALYSIS_OPTIONS = [
  "BE high, FE high",
  "BE high, FE mid",
  "BE high, FE low",
  "BE mid, FE high",
  "BE mid, FE mid",
  "BE mid, FE low",
  "BE low, FE high",
  "BE low, FE mid",
  "BE low, FE low",
]

export default function AddCandidateForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const { toast } = useToast()

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          skills: selectedSkills,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create candidate")
      }

      toast({
        title: "Success",
        description: "Candidate created successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create candidate",
        variant: "destructive",
      })
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        <Controller
          name="position"
          control={control}
          defaultValue="Full-Time"
          rules={{ required: "Position is required" }}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Full-Time" id="full-time" />
                <Label htmlFor="full-time">Full-Time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Intern" id="intern" />
                <Label htmlFor="intern">Intern</Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Technical Skills</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SKILLS.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => toggleSkill(skill)}
              />
              <Label htmlFor={`skill-${skill}`}>{skill}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="selfAnalysis">Self Analysis</Label>
        <Controller
          name="selfAnalysis"
          control={control}
          rules={{ required: "Self analysis is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select self analysis" />
              </SelectTrigger>
              <SelectContent>
                {SELF_ANALYSIS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.selfAnalysis && <p className="text-sm text-red-500">{errors.selfAnalysis.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resumeUrl">Resume URL</Label>
        <Input id="resumeUrl" {...register("resumeUrl")} placeholder="https://example.com/resume.pdf" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interviewLevel">Interview Level</Label>
        <Controller
          name="interviewLevel"
          control={control}
          rules={{ required: "Interview level is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.interviewLevel && <p className="text-sm text-red-500">{errors.interviewLevel.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Candidate"}
        </Button>
      </div>
    </form>
  )
}

