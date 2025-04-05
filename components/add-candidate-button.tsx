"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddCandidateForm from "./add-candidate-form";

interface AddCandidateButtonProps {
  onSuccess?: () => void;
}

export default function AddCandidateButton({ onSuccess }: AddCandidateButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    // Call the parent's onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Candidate
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <AddCandidateForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
