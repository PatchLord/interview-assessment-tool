"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  name: string;
  email: string;
  department: string;
}

interface AddInterviewerFormProps {
  onSuccess?: () => void;
}

export default function AddInterviewerForm({ onSuccess }: AddInterviewerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "interviewer",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create interviewer");
      }

      toast({
        title: "Success",
        description: "Interviewer created successfully",
      });

      setGeneratedPassword(result.generatedPassword);
      setShowPasswordDialog(true);
      reset();

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create interviewer",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register("name", { required: "Name is required" })}
          />
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

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register("department", { required: "Department is required" })}
          />
          {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Interviewer"}
        </Button>
      </form>

      <Dialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interviewer Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              The interviewer account has been created successfully. Please save the generated
              password:
            </p>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded border text-center">
              <code className="text-lg font-bold">{generatedPassword}</code>
            </div>
            <p className="text-sm text-gray-500">
              This password will only be shown once. Please share it with the interviewer securely.
            </p>
            <Button
              className="w-full"
              onClick={() => setShowPasswordDialog(false)}>
              I've Saved the Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
