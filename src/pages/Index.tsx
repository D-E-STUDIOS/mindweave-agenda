import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteCard } from "@/components/NoteCard";
import { TaskCard } from "@/components/TaskCard";
import { AddNoteDialog } from "@/components/AddNoteDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Sparkles, CheckCircle2, FileText } from "lucide-react";

interface Note {
  id: string;
  content: string;
  tags: string[];
  has_tasks: boolean;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
}

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotes();
      fetchTasks();
    }
  }, [session]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
  };

  const handleConvertToTask = async (noteId: string, noteContent: string) => {
    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: session.user.id,
        note_id: noteId,
        title: noteContent.substring(0, 100),
        priority: "medium",
      });

      if (error) throw error;

      await supabase
        .from("notes")
        .update({ has_tasks: true })
        .eq("id", noteId);

      toast({
        title: "Success",
        description: "Note converted to task",
      });

      fetchNotes();
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted",
      });

      fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", taskId);

      if (error) throw error;

      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted",
      });

      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 glow-text">
              <Sparkles className="w-8 h-8" />
              Notes + Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Your intelligent workspace
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Notes</span>
            </div>
            <p className="text-2xl font-bold">{notes.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Tasks</span>
            </div>
            <p className="text-2xl font-bold">
              {activeTasks.length}/{tasks.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full glass-card mb-6">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">
              Notes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notes.length === 0 && tasks.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No notes or tasks yet. Start capturing your thoughts!
                </p>
              </div>
            ) : (
              <>
                {activeTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id, task.completed)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onConvertToTask={() =>
                      handleConvertToTask(note.id, note.content)
                    }
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {notes.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No notes yet. Add your first note!
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onConvertToTask={() =>
                    handleConvertToTask(note.id, note.content)
                  }
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {tasks.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No tasks yet. Convert a note or add one directly!
                </p>
              </div>
            ) : (
              <>
                {activeTasks.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-muted-foreground px-2">
                      Active
                    </h3>
                    {activeTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() =>
                          handleToggleTask(task.id, task.completed)
                        }
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}
                  </>
                )}
                {completedTasks.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-muted-foreground px-2 mt-6">
                      Completed
                    </h3>
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() =>
                          handleToggleTask(task.id, task.completed)
                        }
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <Button
          onClick={() => setShowAddNote(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg glow-border hover:scale-110 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <AddNoteDialog
          open={showAddNote}
          onOpenChange={setShowAddNote}
          onNoteAdded={() => {
            fetchNotes();
            fetchTasks();
          }}
          userId={session.user.id}
        />
      </div>
    </div>
  );
};

export default Index;
