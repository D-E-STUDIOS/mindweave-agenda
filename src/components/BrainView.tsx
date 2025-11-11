import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, TrendingUp, Lightbulb, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


interface BrainAnalysis {
  themes: Array<{
    name: string;
    noteIndices: number[];
    description: string;
  }>;
  connections: Array<{
    noteIndices: number[];
    relationship: string;
  }>;
  insights: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  summary: string;
}

interface BrainViewProps {
  notes: Array<{
    id: string;
    content: string;
    tags: string[];
  }>;
}

export function BrainView({ notes }: BrainViewProps) {
  const [analysis, setAnalysis] = useState<BrainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeNotes = async () => {
    if (notes.length === 0) {
      toast({
        title: "No notes to analyze",
        description: "Create some notes first to get AI insights!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('brain-insights', {
        body: { notes }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Brain analysis complete!",
        description: "Found patterns and insights in your notes.",
      });
    } catch (error: any) {
      console.error('Error analyzing notes:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notes.length > 0 && !analysis) {
      analyzeNotes();
    }
  }, [notes.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-destructive/50 bg-destructive/10 text-destructive";
      case "medium": return "border-primary/50 bg-primary/10 text-primary";
      default: return "border-muted/50 bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Neural Network</h2>
              <p className="text-sm text-muted-foreground">AI-powered insights from your notes</p>
            </div>
          </div>
          <Button
            onClick={analyzeNotes}
            disabled={loading || notes.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Re-analyze
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-1 p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Brain className="w-12 h-12 text-primary animate-pulse mx-auto" />
            <p className="text-muted-foreground">Analyzing your neural pathways...</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          {/* Themes */}
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Key Themes</h3>
            </div>
            <div className="space-y-3">
              {analysis.themes.map((theme, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{theme.name}</h4>
                    <Badge variant="secondary" className="bg-secondary/30">
                      {theme.noteIndices.length} notes
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connections */}
          {analysis.connections.length > 0 && (
            <div className="glass-card p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Link className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Connections</h3>
              </div>
              <div className="space-y-3">
                {analysis.connections.map((connection, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:border-accent/40 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-1 mt-1">
                        {connection.noteIndices.map((noteIdx) => (
                          <div key={noteIdx} className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-medium text-primary">
                            {noteIdx + 1}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">{connection.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Insights & Recommendations</h3>
            </div>
            <div className="space-y-3">
              {analysis.insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)} transition-all hover:scale-[1.01]`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="capitalize">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
