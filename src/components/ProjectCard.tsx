import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    color: string;
    start_date?: string;
    end_date?: string;
    completed: boolean;
    created_at: string;
  };
  onToggle: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onToggle, onDelete }: ProjectCardProps) {
  return (
    <div 
      className="glass-card p-4 rounded-xl hover:glow-border transition-all duration-300 animate-fade-in"
      style={{ borderLeft: `4px solid ${project.color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold ${project.completed ? "line-through text-muted-foreground" : ""}`}>
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-primary/20 hover:text-primary"
          >
            <CheckCircle2 className={`w-4 h-4 ${project.completed ? "fill-current" : ""}`} />
          </Button>
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

      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        {project.start_date && (
          <Badge variant="secondary" className="bg-secondary/20">
            Start: {format(new Date(project.start_date), "MMM d, yyyy")}
          </Badge>
        )}
        {project.end_date && (
          <Badge variant="secondary" className="bg-secondary/20">
            End: {format(new Date(project.end_date), "MMM d, yyyy")}
          </Badge>
        )}
      </div>
    </div>
  );
}
