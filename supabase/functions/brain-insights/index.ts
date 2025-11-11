import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    console.log('Analyzing notes for connections and insights:', notes.length);

    const notesText = notes.map((note: any, idx: number) => 
      `Note ${idx + 1}: ${note.content}\nTags: ${note.tags.join(', ')}`
    ).join('\n\n');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent neural network that analyzes notes to find patterns, connections, and insights. 
            Your goal is to help users understand relationships between their ideas and provide actionable insights.
            Analyze the notes and identify:
            1. Key themes and patterns
            2. Connections between different notes
            3. Emerging ideas or trends
            4. Actionable insights or recommendations
            
            Use the analyze_brain function to return your analysis.`
          },
          {
            role: 'user',
            content: `Analyze these notes and find meaningful connections and insights:\n\n${notesText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_brain',
              description: 'Analyze notes to find connections and generate insights',
              parameters: {
                type: 'object',
                properties: {
                  themes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Theme name' },
                        noteIndices: { type: 'array', items: { type: 'number' }, description: 'Indices of related notes' },
                        description: { type: 'string', description: 'Description of the theme' }
                      },
                      required: ['name', 'noteIndices', 'description']
                    },
                    description: 'Key themes found in the notes'
                  },
                  connections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        noteIndices: { type: 'array', items: { type: 'number' }, description: 'Connected note indices' },
                        relationship: { type: 'string', description: 'How these notes are connected' }
                      },
                      required: ['noteIndices', 'relationship']
                    },
                    description: 'Connections between different notes'
                  },
                  insights: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Insight title' },
                        description: { type: 'string', description: 'Detailed insight' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priority level' }
                      },
                      required: ['title', 'description', 'priority']
                    },
                    description: 'Actionable insights and recommendations'
                  },
                  summary: {
                    type: 'string',
                    description: 'Overall summary of the analysis'
                  }
                },
                required: ['themes', 'connections', 'insights', 'summary']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_brain' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Analysis complete:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brain-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
