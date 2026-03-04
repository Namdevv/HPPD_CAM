import Database from "better-sqlite3";

const db = new Database("wishes.db");

// Initialize database (safe to run multiple times)
db.exec(`
  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default function handler(req: any, res: any) {
  const method = req.method;

  if (method === "GET") {
    const wishes = db.prepare("SELECT * FROM wishes ORDER BY created_at DESC LIMIT 50").all();
    return res.status(200).json(wishes);
  }

  if (method === "POST") {
    const { name, content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: "Nội dung lời chúc không được để trống" });
    }
    const info = db.prepare("INSERT INTO wishes (name, content) VALUES (?, ?)").run(name || "Người ẩn danh", content);
    return res.status(200).json({ id: info.lastInsertRowid });
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end("Method Not Allowed");
}
