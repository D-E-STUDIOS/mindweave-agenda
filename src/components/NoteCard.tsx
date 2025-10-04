import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface NoteCardProps {
  note: {
    id: string;
    content: string;
    tags: string[];
    has_tasks: boolean;
    created_at: string;
  };
  onConvertToTask: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onConvertToTask, onDelete }: NoteCardProps) {
  return (
    <div className="glass-card p-4 rounded-xl hover:glow-border transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-foreground flex-1">{note.content}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="ml-2 hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-secondary/20 text-secondary border-secondary/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
        {!note.has_tasks && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onConvertToTask}
            className="text-primary hover:text-primary hover:bg-primary/10 h-7"
          >
            Convert to Task
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
