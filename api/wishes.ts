import kvStore from './kv-store';

interface Wish {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

export default async function handler(req: any, res: any) {
  const method = req.method;

  try {
    if (method === "GET") {
      // Fetch all wishes from KV store
      const wishIds = await kvStore.lrange("wishes:ids", 0, 49);
      const wishes: Wish[] = [];

      for (const id of wishIds) {
        const wish = await kvStore.hgetall(`wish:${id}`);
        if (wish) {
          wishes.push({
            id: parseInt(id as string),
            name: (wish.name as string) || "Người ẩn danh",
            content: wish.content as string,
            created_at: wish.created_at as string
          });
        }
      }

      return res.status(200).json(wishes);
    }

    if (method === "POST") {
      const { name, content } = req.body || {};
      if (!content) {
        return res.status(400).json({ error: "Nội dung lời chúc không được để trống" });
      }

      // Generate unique ID
      const id = await kvStore.incr("wish:counter");

      // Store wish data
      const createdAt = new Date().toISOString();
      await kvStore.hset(`wish:${id}`, {
        id,
        name: name || "Người ẩn danh",
        content,
        created_at: createdAt
      });

      // Add ID to sorted list (newest first)
      await kvStore.lpush("wishes:ids", id.toString());

      // Trim to keep only last 50
      await kvStore.ltrim("wishes:ids", 0, 49);

      return res.status(200).json({ id });
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Lỗi server: " + (error as any).message });
  }
}
