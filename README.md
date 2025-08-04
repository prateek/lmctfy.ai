# LMCTFY.ai

**Let Me ChatGPT That For You** - A playful tool inspired by LMGTFY that demonstrates how to ask ChatGPT a question through an animated browser simulation.

## Overview

LMCTFY.ai is a single-page web application that helps users create shareable links that demonstrate asking ChatGPT questions. When someone clicks the generated link, they see an animated browser simulation showing the steps to ask ChatGPT, followed by an automatic redirect to ChatGPT with the question pre-filled.

## Features

- **Link Generator**: Enter a question and generate a shareable LMCTFY link
- **Animated Demo**: Shows a step-by-step browser simulation of asking ChatGPT
- **Short URLs**: Create shortened links for easier sharing via Cloudflare KV storage
- **Preview Mode**: Preview the animated demo without redirecting to ChatGPT
- **Responsive Design**: Works on desktop and mobile devices
- **No Dependencies**: Pure HTML, CSS, and JavaScript - no external libraries

## How It Works

1. **Generator Mode** (default): Enter a question and generate a shareable link
2. **Player Mode** (when `?q=` parameter is present): Shows animated demo with these steps:
   - Step 1: Navigate to chat.openai.com
   - Step 2: Type the question
   - Step 3: Hit Send
   - Redirect to ChatGPT with the question pre-filled

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (single file)
- **Backend**: Cloudflare Pages Functions for URL shortening
- **Storage**: Cloudflare KV for short URL mappings
- **Deployment**: Cloudflare Pages

## Development

### Prerequisites

- Node.js and npm
- Cloudflare account (for KV storage and deployment)
- Wrangler CLI

### Local Development

```bash
# Install dependencies (optional - no build dependencies required)
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare Pages
npm run deploy

# View deployment logs
npm run logs
```

### Development Workflow

1. **Local Testing**: Use `npm run dev` to test locally on `http://localhost:8788`
2. **Manual Deployment**: Use `wrangler pages deploy --branch main` for production
3. **Preview Deployments**: Use other branch names for preview environments
4. **KV Testing**: KV storage works in both local and deployed environments

### Project Structure

```
├── public/
│   ├── index.html          # Main application file
│   └── assets/
│       └── logo.png        # LMCTFY logo
├── functions/
│   └── api/
│       └── kv/
│           └── index.js    # KV API endpoint for short URLs
├── package.json            # NPM scripts and metadata
├── wrangler.toml          # Cloudflare configuration
└── README.md              # This file
```

## Configuration

The application uses Cloudflare KV for URL shortening. The KV namespace binding is configured in `wrangler.toml`:

```toml
name = "lmctfy-ai"
compatibility_date = "2025-08-04"
pages_build_output_dir = "public"

[[kv_namespaces]]
binding = "LMCTFY_KV"
id = "15c67f509d4e46548fb840754d3128bc"
preview_id = "2ff697068ff64deda85350624d557f18"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "LMCTFY_KV"
id = "15c67f509d4e46548fb840754d3128bc"

[env.preview]
vars = { ENVIRONMENT = "preview" }

[[env.preview.kv_namespaces]]
binding = "LMCTFY_KV"
preview_id = "2ff697068ff64deda85350624d557f18"
```

### Environment Setup

1. **KV Namespace**: Create a KV namespace in your Cloudflare dashboard
2. **Update IDs**: Replace the KV namespace IDs in `wrangler.toml` with your own
3. **Authentication**: Run `wrangler login` to authenticate with Cloudflare

## API Endpoints

### POST /api/kv
Create a short URL for a prompt.

**Request Body:**
```json
{
  "prompt": "Your ChatGPT question here"
}
```

**Response:**
```json
{
  "shortUrl": "https://lmctfy.ai/abc123",
  "key": "abc123",
  "originalUrl": "https://lmctfy.ai/?q=encoded-prompt"
}
```

### GET /api/kv?key=abc123
Retrieve the original prompt from a short URL key.

**Response:**
```json
{
  "value": {
    "prompt": "Your ChatGPT question here",
    "createdAt": 1690234567890,
    "originalUrl": "https://lmctfy.ai/?q=encoded-prompt"
  }
}
```

## Usage Examples

### Basic Link Generation
```
https://lmctfy.ai/?q=How%20do%20I%20center%20a%20div%20in%20CSS%3F
```

### Preview Mode
```
https://lmctfy.ai/?q=How%20do%20I%20center%20a%20div%20in%20CSS%3F&preview=1
```

### Short URL
```
https://lmctfy.ai/abc123
```

## Deployment

The application is deployed to Cloudflare Pages and accessible at:
- **Production**: [lmctfy.ai](https://lmctfy.ai)
- **Pages Subdomain**: [lmctfy-ai.pages.dev](https://lmctfy-ai.pages.dev)

### Deployment Methods

#### Option 1: Manual Deployment (Current Setup)

```bash
# Deploy to production (main branch)
wrangler pages deploy --branch main

# Deploy to preview (other branches)
wrangler pages deploy --branch feature-branch
```

#### Option 2: Git Integration (Recommended for CI/CD)

Connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Pages
2. Select your project > Settings > Build & deployments
3. Connect your GitHub repository
4. Set build configuration:
   - **Build command**: `` (empty)
   - **Build output directory**: `public`
   - **Root directory**: `/`

### Custom Domain Setup

1. **Add domain to Cloudflare**: Ensure `lmctfy.ai` is managed by Cloudflare DNS
2. **Configure nameservers**: Point your domain's nameservers to Cloudflare
3. **Add custom domain**: In Pages project settings, add `lmctfy.ai` as custom domain
4. **SSL certificate**: Cloudflare automatically provisions SSL certificates

### Important Notes

- Use `--branch main` for production deployments to ensure custom domain works
- Preview deployments (other branches) only work on `*.pages.dev` subdomains  
- KV namespaces must be configured for both production and preview environments
- Changes to `wrangler.toml` require redeployment to take effect

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Credits

- Created by [Prateek Rungta](https://github.com/prateek)
- Inspired by the original [LMGTFY](https://lmgtfy.com)
- Not affiliated with OpenAI

## Links

- **Live Site**: [lmctfy.ai](https://lmctfy.ai)
- **GitHub**: [github.com/prateek/lmctfy.ai](https://github.com/prateek/lmctfy.ai)
- **Author**: [@prateekrungta](https://twitter.com/prateekrungta)