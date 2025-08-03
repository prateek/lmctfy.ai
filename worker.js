// ABOUTME: Cloudflare Worker for URL shortening and routing
// ABOUTME: Handles short URL creation and resolution using KV storage

export default {
  async fetch(request, env, ctx) {
    try {
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
          // Basic rate limiting by IP
          const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
          const rateLimitKey = `rate_limit:${clientIP}`;
          const currentCount = await env.URLS.get(rateLimitKey);

          if (currentCount && parseInt(currentCount) > 100) { // 100 requests per hour
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Increment rate limit counter
          await env.URLS.put(rateLimitKey, (parseInt(currentCount) + 1 || 1).toString(), { expirationTtl: 3600 });

          const { prompt } = await request.json();

          if (!prompt || typeof prompt !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Validate prompt length and content
          if (prompt.length > 16000) {
            return new Response(JSON.stringify({ error: 'Prompt too long (max 16000 characters)' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Basic sanitization - remove control characters
          const sanitizedPrompt = prompt.replace(/[\x00-\x1F\x7F]/g, '');

          // Generate short code
          const shortCode = await generateShortCode(env);

          // Store in KV permanently
          await env.URLS.put(shortCode, sanitizedPrompt);

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

      // For now, serve static files from worker
      // TODO: Eventually move to Pages deployment
      return handleStaticRequest(request, env);

    } catch (error) {
      // Log error for monitoring
      console.error('Worker error:', error.message, error.stack);

      // Return user-friendly error
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
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

  // Try to serve from static assets first
  try {
    // For Cloudflare Workers Sites integration
    if (env.__STATIC_CONTENT) {
      // For index.html, use the hashed filename
      let assetKey = pathname.replace(/^\//, '');
      if (assetKey === 'index.html') {
        assetKey = 'index.dbe6e62a8d.html';
      } else if (assetKey === 'logo.png') {
        assetKey = 'logo.1129e611dc.png';
      }

      const content = await env.__STATIC_CONTENT.get(assetKey, 'arrayBuffer');
      if (content) {
        const contentType = getContentType(pathname);
        return new Response(content, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'ETag': `"${assetKey}"` // Add ETag for cache validation
          }
        });
      }
    }
  } catch (e) {
    // Static content not available
  }


  // Fallback: return a 404 for missing files
  return new Response('Not Found', { status: 404 });
}

// Helper function to get content type based on file extension
function getContentType(pathname) {
  const ext = pathname.split('.').pop()?.toLowerCase();
  const types = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon'
  };
  return types[ext] || 'text/plain';
}
