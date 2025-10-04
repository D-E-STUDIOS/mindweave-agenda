import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: string;
    due_date?: string;
  };
  onToggle: () => void;
  onDelete: () => void;
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className="glass-card p-4 rounded-xl hover:glow-border transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-1 border-primary data-[state=checked]:bg-primary"
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium mb-1 ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={priorityColors[task.priority] || priorityColors.medium}>
              {task.priority}
            </Badge>
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), "MMM d")}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
