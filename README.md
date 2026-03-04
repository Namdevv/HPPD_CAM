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

This project builds a static frontend (Vite) and exposes a serverless API under `/api/wishes` that uses **Vercel KV** (Redis) for persistent data storage.

### Setup Steps

1. **Enable Vercel KV in your project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Navigate to **Storage** tab
   - Click **Create Database** and select **KV** 
   - Confirm setup (Vercel will auto-populate environment variables)

2. **Install dependencies locally:**
   ```bash
   npm install
   ```

3. **Build the static site:**
   ```bash
   npm run vercel-build
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

### Why Vercel KV?

- **Persistent storage** across serverless invocations (SQLite on Vercel is ephemeral).
- **Integrated** into Vercel—no external database service needed.
- **Auto-scales** with your traffic.

### Alternative: External Database

If you prefer, you can replace Vercel KV with **Supabase PostgreSQL**:
- Install `@supabase/supabase-js`
- Update `api/wishes.ts` to use Supabase client
- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` env vars in Vercel dashboard

