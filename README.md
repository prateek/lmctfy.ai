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
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare Pages
npm run deploy

# View logs
npm run logs
```

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
[[kv_namespaces]]
binding = "LMCTFY_KV"
id = "your-kv-namespace-id"
```

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

The application is automatically deployed to Cloudflare Pages via GitHub Actions when changes are pushed to the main branch.

### Manual Deployment

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy public --project-name lmctfy-ai
```

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