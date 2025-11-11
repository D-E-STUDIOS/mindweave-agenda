import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: () => void;
  userId: string;
}

export function AddNoteDialog({
  open,
  onOpenChange,
  onNoteAdded,
  userId,
}: AddNoteDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // Analyze the note with AI
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-note",
        {
          body: { content },
        }
      );

      if (analysisError) throw analysisError;

      console.log("Analysis result:", analysisData);

      // Save the note with AI-generated tags
      const { error: insertError } = await supabase.from("notes").insert({
        user_id: userId,
        content,
        tags: analysisData.tags || [],
        has_tasks: analysisData.has_tasks || false,
      });

      if (insertError) throw insertError;

      // If tasks were found, create them
      if (analysisData.tasks && analysisData.tasks.length > 0) {
        const { error: tasksError } = await supabase.from("tasks").insert(
          analysisData.tasks.map((task: any) => ({
            user_id: userId,
            title: task.title,
            description: task.description || null,
            priority: task.priority,
          }))
        );

        if (tasksError) throw tasksError;

        toast({
          title: "Success!",
          description: `Note saved with ${analysisData.tasks.length} task(s) extracted.`,
        });
      } else {
        toast({
          title: "Success!",
          description: "Note saved successfully.",
        });
      }

      setContent("");
      onOpenChange(false);
      onNoteAdded();
    } catch (error: any) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add Note
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind? AI will auto-tag and extract tasks..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-input/50 border-white/10 resize-none"
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
