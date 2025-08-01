// ABOUTME: Cloudflare Worker for URL shortening and routing
// ABOUTME: Handles short URL creation and resolution using KV storage

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoint to create short URL
    if (url.pathname === '/api/shorten' && request.method === 'POST') {
      try {
        const { prompt } = await request.json();
        
        if (!prompt || typeof prompt !== 'string') {
          return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Generate short code
        const shortCode = await generateShortCode(env);
        
        // Store in KV permanently
        await env.URLS.put(shortCode, prompt);
        
        return new Response(JSON.stringify({ 
          shortCode,
          shortUrl: `https://lmctfy.ai/s/${shortCode}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create short URL' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle short URL resolution
    if (url.pathname.startsWith('/s/')) {
      const shortCode = url.pathname.slice(3);
      
      if (!shortCode) {
        return Response.redirect('https://lmctfy.ai/', 302);
      }

      const prompt = await env.URLS.get(shortCode);
      
      if (!prompt) {
        // Short URL not found, redirect to home
        return Response.redirect('https://lmctfy.ai/', 302);
      }

      // Check for preview parameter
      const isPreview = url.searchParams.has('preview');
      
      // Redirect to full URL with prompt
      const redirectUrl = `https://lmctfy.ai/?q=${encodeURIComponent(prompt)}${isPreview ? '&preview=1' : ''}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Serve static files from the root domain
    return handleStaticRequest(request, env);
  }
};

// Generate a random short code (6 characters)
async function generateShortCode(env) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  
  while (attempts < 10) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Check if code already exists
    const existing = await env.URLS.get(code);
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback to timestamp-based code if random generation fails
  return Date.now().toString(36);
}

// Handle static file requests
async function handleStaticRequest(request, env) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    return new Response('Not Found', { status: 404 });
  }
  
  // Try to fetch from KV static assets (if using Cloudflare Pages)
  // Otherwise fall back to fetching from origin
  try {
    // For Cloudflare Pages integration
    const asset = await env.ASSETS.fetch(request);
    if (asset.status === 200) {
      return asset;
    }
  } catch (e) {
    // ASSETS namespace might not exist in dev
  }
  
  // For standalone deployment, fetch from origin
  const response = await fetch(`https://lmctfy.ai${pathname}`);
  return response;
}