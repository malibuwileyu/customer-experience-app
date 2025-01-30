import { serve } from 'https://deno.fresh.dev/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.24.1'

interface RequestBody {
  prompt: string
  context: {
    includeKnowledgeBase: boolean
    tonePreference: 'professional' | 'casual' | 'friendly' | 'formal'
  }
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    // Get request body
    const { prompt, context } = await req.json() as RequestBody

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }))

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get relevant knowledge base articles if requested
    let knowledgeContext = ''
    if (context.includeKnowledgeBase) {
      const { data: articles } = await supabaseClient
        .from('kb_articles')
        .select('title, content')
        .limit(3)
        .order('created_at', { ascending: false })

      if (articles?.length) {
        knowledgeContext = `\nRelevant knowledge base articles:\n${articles
          .map((article) => `${article.title}:\n${article.content}`)
          .join('\n\n')}`
      }
    }

    // Generate response using OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer service AI assistant. 
          Maintain a ${context.tonePreference} tone in your responses.
          ${knowledgeContext ? 'Use the provided knowledge base articles to inform your response.' : ''}`,
        },
        {
          role: 'user',
          content: prompt + knowledgeContext,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = completion.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return new Response(
      JSON.stringify({
        content,
        context: {
          tone: context.tonePreference,
          usedKnowledgeBase: context.includeKnowledgeBase,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate message' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
}) 