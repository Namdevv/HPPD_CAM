import { Redis } from '@upstash/redis';

interface Wish {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

// Initialize Redis from environment
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || ''
});

// Fallback in-memory store
class InMemoryStore {
  private data: Map<string, any> = new Map();
  async lpush(key: string, ...values: string[]): Promise<number> {
    const list = this.data.get(key) || [];
    list.unshift(...values);
    this.data.set(key, list);
    return list.length;
  }
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = (this.data.get(key) || []).slice(start, stop + 1);
    return list;
  }
  async ltrim(key: string, start: number, stop: number): Promise<string> {
    const list = this.data.get(key) || [];
    this.data.set(key, list.slice(start, stop + 1));
    return "OK";
  }
  async incr(key: string): Promise<number> {
    const val = (this.data.get(key) || 0) + 1;
    this.data.set(key, val);
    return val;
  }
  async hset(key: string, data: Record<string, any>): Promise<number> {
    this.data.set(key, { ...this.data.get(key), ...data });
    return Object.keys(data).length;
  }
  async hgetall(key: string): Promise<Record<string, any> | null> {
    return this.data.get(key) || null;
  }
}

const inMemoryStore = new InMemoryStore();
const useRedis = !!process.env.KV_REST_API_URL;

// Store wrapper
const kvStore = {
  lpush: async (key: string, ...values: string[]) => {
    if (useRedis) {
      try {
        return await redis.lpush(key, ...values);
      } catch (e) {
        console.error("Redis lpush error:", e);
        return inMemoryStore.lpush(key, ...values);
      }
    }
    return inMemoryStore.lpush(key, ...values);
  },
  lrange: async (key: string, start: number, stop: number) => {
    if (useRedis) {
      try {
        return (await redis.lrange(key, start, stop)) as string[];
      } catch (e) {
        console.error("Redis lrange error:", e);
        return inMemoryStore.lrange(key, start, stop);
      }
    }
    return inMemoryStore.lrange(key, start, stop);
  },
  ltrim: async (key: string, start: number, stop: number) => {
    if (useRedis) {
      try {
        return (await redis.ltrim(key, start, stop)) as string;
      } catch (e) {
        console.error("Redis ltrim error:", e);
        return inMemoryStore.ltrim(key, start, stop);
      }
    }
    return inMemoryStore.ltrim(key, start, stop);
  },
  incr: async (key: string) => {
    if (useRedis) {
      try {
        return await redis.incr(key);
      } catch (e) {
        console.error("Redis incr error:", e);
        return inMemoryStore.incr(key);
      }
    }
    return inMemoryStore.incr(key);
  },
  hset: async (key: string, data: Record<string, any>) => {
    if (useRedis) {
      try {
        return await redis.hset(key, data);
      } catch (e) {
        console.error("Redis hset error:", e);
        return inMemoryStore.hset(key, data);
      }
    }
    return inMemoryStore.hset(key, data);
  },
  hgetall: async (key: string) => {
    if (useRedis) {
      try {
        return (await redis.hgetall(key)) as Record<string, any> | null;
      } catch (e) {
        console.error("Redis hgetall error:", e);
        return inMemoryStore.hgetall(key);
      }
    }
    return inMemoryStore.hgetall(key);
  },
};

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