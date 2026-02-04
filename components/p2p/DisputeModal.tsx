"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, AlertCircle } from "lucide-react";

interface DisputeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, evidence: File | null) => Promise<void>;
}

export function DisputeModal({ open, onClose, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidence(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
        setError("Please provide a reason for the dispute.");
        return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(reason, evidence);
      onClose();
      setReason("");
      setEvidence(null);
    } catch (err) {
        // Error handling should be done in parent, but we can set generic error here if needed
        console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Issue / Dispute</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Dispute <span className="text-red-500">*</span></Label>
            <Textarea
              id="reason"
              placeholder="Describe the issue... (e.g. I have paid but seller hasn't released)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence (Optional)</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="evidence"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
            </div>
            <p className="text-xs text-muted-foreground">Upload payment proof or screenshot of conversation.</p>
          </div>

          {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
              </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Dispute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
