import express from "express";
import { createServer as createViteServer } from "vite";
import kvStore from "./api/kv-store.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (for local dev; Vercel uses api/wishes.ts)
  app.get("/api/wishes", async (req, res) => {
    try {
      const wishIds = await kvStore.lrange("wishes:ids", 0, 49);
      const wishes = [];
      for (const id of wishIds) {
        const wish = await kvStore.hgetall(`wish:${id}`);
        if (wish) {
          wishes.push({
            id: parseInt(id),
            name: wish.name || "Người ẩn danh",
            content: wish.content,
            created_at: wish.created_at
          });
        }
      }
      res.json(wishes);
    } catch (error) {
      console.error("GET /api/wishes error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/wishes", async (req, res) => {
    try {
      const { name, content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Nội dung lời chúc không được để trống" });
      }
      const id = await kvStore.incr("wish:counter");
      const createdAt = new Date().toISOString();
      await kvStore.hset(`wish:${id}`, {
        id,
        name: name || "Người ẩn danh",
        content,
        created_at: createdAt
      });
      await kvStore.lpush("wishes:ids", id.toString());
      await kvStore.ltrim("wishes:ids", 0, 49);
      res.json({ id });
    } catch (error) {
      console.error("POST /api/wishes error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
