<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/57b31d80-01e4-492a-a325-b35257dd62e6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

This project builds a static frontend (Vite) and exposes a serverless API under `/api/wishes` that uses **Upstash Redis** (via `@upstash/redis`) for persistent data storage.

### Setup Steps

1. **Get Redis credentials** (if not already set up):
   - Go to [Upstash Console](https://console.upstash.io)
   - Create a new Redis database
   - Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Add them to [.env.local](.env.local)

2. **Or use Vercel KV** (auto-setup):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Storage** tab
   - Create or connect a **KV** database
   - Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`

3. **Install dependencies locally:**
   ```bash
   npm install
   ```

4. **Test locally:**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000 and try posting a wish

5. **Build the static site:**
   ```bash
   npm run vercel-build
   ```

6. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

### Why Upstash Redis?

- **Portable** — Works on Vercel, local machine, Docker, any platform
- **Native Redis client** — Direct `@upstash/redis` (no wrapper)
- **Persistent** — Data survives serverless function invocations
- **Free tier** — Generous free quota for hobby projects
- **Fallback** — Uses in-memory store if Redis credentials missing (for local dev)

