import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { CheckCircle2, FolderKanban } from "lucide-react";

interface CalendarViewProps {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    due_date?: string;
    priority: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    color: string;
    start_date?: string;
    end_date?: string;
    completed: boolean;
  }>;
}

export function CalendarView({ tasks, projects }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getItemsForDate = (date: Date) => {
    const tasksForDate = tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), date)
    );
    
    const projectsForDate = projects.filter((project) => {
      const start = project.start_date ? new Date(project.start_date) : null;
      const end = project.end_date ? new Date(project.end_date) : null;
      
      if (start && isSameDay(start, date)) return true;
      if (end && isSameDay(end, date)) return true;
      if (start && end && date >= start && date <= end) return true;
      
      return false;
    });

    return { tasksForDate, projectsForDate };
  };

  const { tasksForDate, projectsForDate } = getItemsForDate(selectedDate);

  const modifiers = {
    hasTasks: (date: Date) => {
      const { tasksForDate, projectsForDate } = getItemsForDate(date);
      return tasksForDate.length > 0 || projectsForDate.length > 0;
    },
  };

  const modifiersStyles = {
    hasTasks: { 
      backgroundColor: "hsl(var(--primary) / 0.2)",
      fontWeight: "bold" 
    },
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="pointer-events-auto mx-auto"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, "MMMM d, yyyy")}
        </h3>

        {tasksForDate.length === 0 && projectsForDate.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center">
            <p className="text-muted-foreground">No tasks or projects on this date</p>
          </div>
        ) : (
          <>
            {projectsForDate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">Projects</h4>
                </div>
                <div className="space-y-2">
                  {projectsForDate.map((project) => (
                    <div
                      key={project.id}
                      className="glass-card p-3 rounded-lg"
                      style={{ borderLeft: `4px solid ${project.color}` }}
                    >
                      <p className={project.completed ? "line-through text-muted-foreground" : ""}>
                        {project.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasksForDate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">Tasks</h4>
                </div>
                <div className="space-y-2">
                  {tasksForDate.map((task) => (
                    <div key={task.id} className="glass-card p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className={task.completed ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </p>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
