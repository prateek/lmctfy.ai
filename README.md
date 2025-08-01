# LMCTFY.ai - Let Me ChatGPT That For You

A single-page web tool that creates shareable links to demonstrate how easy it is to ask ChatGPT a question. Similar to LMGTFY, but for ChatGPT.

**Live at:** [https://lmctfy.ai](https://lmctfy.ai)

## Features

- 🔗 Generate shareable links with embedded prompts
- 🔗 URL shortening service (e.g., `lmctfy.ai/s/abc123`)
- 🎬 Animated demonstration showing how to use ChatGPT
- 📱 Fully responsive design
- 🚀 Single HTML file + Cloudflare Worker
- ⚡ Instant deployment to Cloudflare Pages

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/prateek/lmctfy.ai.git
cd lmctfy.ai
```

2. Open `index.html` in your browser to test locally

3. For development with tests:
```bash
npm install
npm test
```

## Deployment

### Cloudflare Pages + Workers (Recommended)

1. Fork this repository
2. Set up Cloudflare KV namespace:
   ```bash
   wrangler kv:namespace create URLS
   ```
3. Update `wrangler.toml` with your KV namespace ID
4. Deploy the Worker:
   ```bash
   wrangler deploy
   ```
5. Connect your GitHub account to Cloudflare Pages
6. Create a new project and select your fork
7. No build command needed - deploy directory is `/`
8. Add secrets for automated deployments:
   - `CF_API_TOKEN` - Your Cloudflare API token
   - `CF_ACCOUNT_ID` - Your Cloudflare account ID

### GitHub Actions

The repository includes automated CI/CD:
- Tests run on every push and PR
- Automatic deployment to Cloudflare Pages on main branch

Required secrets:
- `CF_API_TOKEN` - Your Cloudflare API token
- `CF_ACCOUNT_ID` - Your Cloudflare account ID

### Manual Deployment

Simply upload `index.html` to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

## Development

### Testing

```bash
npm test          # Run tests once
npm test:watch    # Run tests in watch mode
```

### Project Structure

```
/
├── index.html      # Single-file application
├── worker.js       # Cloudflare Worker for URL shortening
├── wrangler.toml   # Cloudflare Worker configuration
├── package.json    # NPM configuration (dev dependencies only)
├── jest.config.js  # Jest test configuration
├── lmctfy.test.js  # Unit tests
├── LICENSE         # MIT license
└── README.md       # This file
```

## How It Works

1. **Generator Mode** (default): Enter a prompt and generate a shareable link
   - Choose between short URLs (`lmctfy.ai/s/abc123`) or long URLs
   - Short URLs are stored permanently in Cloudflare KV
2. **Player Mode** (`?q=<prompt>` or `/s/<code>`): Shows typing animation then redirects to ChatGPT
3. **Preview Mode** (`?q=<prompt>&preview=1`): Shows animation without redirecting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created by [Prateek Rungta](https://github.com/prateek)

---

Not affiliated with OpenAI