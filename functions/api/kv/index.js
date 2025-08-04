// ABOUTME: Cloudflare KV API endpoint for storing and retrieving URL mappings
// ABOUTME: Handles POST requests to store short URLs and GET requests to retrieve them

export async function onRequest(context) {
  const { request, env } = context;
    const url = new URL(request.url);
    
    // Add CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      if (request.method === 'GET') {
        // Get short URL data
        const key = url.searchParams.get('key');
        if (!key) {
          return new Response(JSON.stringify({ error: 'Key parameter required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const value = await env.LMCTFY_KV.get(key);
        if (!value) {
          return new Response(JSON.stringify({ error: 'Key not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ value: JSON.parse(value) }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else if (request.method === 'POST') {
        // Store short URL data
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'Prompt required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Generate a short key (6 characters)
        const shortKey = Math.random().toString(36).substring(2, 8);
        const baseUrl = new URL(request.url).origin.replace('/api/kv', '');
        const shortUrl = `${baseUrl}/${shortKey}`;

        // Store the mapping
        const data = {
          prompt,
          createdAt: Date.now(),
          originalUrl: `https://lmctfy.ai/?q=${encodeURIComponent(prompt)}`
        };

        await env.LMCTFY_KV.put(shortKey, JSON.stringify(data));

        return new Response(JSON.stringify({ 
          shortUrl,
          key: shortKey,
          originalUrl: data.originalUrl
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}