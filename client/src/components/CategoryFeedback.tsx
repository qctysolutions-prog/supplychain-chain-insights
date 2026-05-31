/**
 * CategoryFeedback Component
 * Allows users to provide feedback on news categories with relevance toggle
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, ThumbsDown, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CategoryFeedbackProps {
  category: string;
}

export default function CategoryFeedback({ category }: CategoryFeedbackProps) {
  const [isRelevant, setIsRelevant] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsRelevant(null);
        setFeedbackText("");
        setUserEmail("");
      }, 3000);
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (isRelevant === null) {
      toast.error("Please indicate if this category is relevant to you");
      return;
    }

    submitFeedback.mutate({
      category,
      isRelevant,
      feedbackText: feedbackText.trim() || undefined,
      userEmail: userEmail.trim() || undefined,
    });
  };

  if (isSubmitted) {
    return (
      <div className="glass-card rounded-xl p-6 border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <p className="font-semibold">Feedback submitted successfully!</p>
            <p className="text-sm text-muted-foreground">Thank you for helping us improve.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 border border-border mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Share Your Feedback</h3>
      </div>

      {/* Relevance Toggle */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Is this category relevant to your work?
        </Label>
        <div className="flex gap-3">
          <Button
            variant={isRelevant === true ? "default" : "outline"}
            size="sm"
            onClick={() => setIsRelevant(true)}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Relevant
          </Button>
          <Button
            variant={isRelevant === false ? "default" : "outline"}
            size="sm"
            onClick={() => setIsRelevant(false)}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            Not Relevant
          </Button>
        </div>
      </div>

      {/* Feedback Text */}
      <div className="mb-4">
        <Label htmlFor={`feedback-${category}`} className="text-sm font-medium text-foreground mb-2 block">
          Additional comments (optional)
        </Label>
        <Textarea
          id={`feedback-${category}`}
          placeholder="Share your thoughts on this category, suggest improvements, or request specific topics..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Email (optional) */}
      <div className="mb-4">
        <Label htmlFor={`email-${category}`} className="text-sm font-medium text-foreground mb-2 block">
          Email (optional, for follow-up)
        </Label>
        <Input
          id={`email-${category}`}
          type="email"
          placeholder="your.email@example.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={submitFeedback.isPending || isRelevant === null}
        className="w-full flex items-center justify-center gap-2"
      >
        {submitFeedback.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </Button>
    </div>
  );
}
