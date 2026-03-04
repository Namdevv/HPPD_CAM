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

This project builds a static frontend (Vite) and exposes a serverless API under `/api/wishes`.

1. Install the Vercel CLI (optional locally):
   ```bash
   npm i -g vercel
   ```
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Build the static site:
   ```bash
   npm run vercel-build
   ```
4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

Notes:
- The API uses a local SQLite database file `wishes.db` stored alongside functions. On Vercel serverless this storage is ephemeral across invocations; for persistent data use an external DB.
- If you need to keep a Node server instead of serverless functions, deploy to a platform that supports long-running Node processes.
