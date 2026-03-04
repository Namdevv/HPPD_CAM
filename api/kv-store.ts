import { Redis } from '@upstash/redis';

// Initialize Redis from environment
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || ''
});

// Fallback in-memory store for local dev without Redis
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
let kvReady = false;
let useRedis = false;

// Check if Redis credentials are available
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  useRedis = true;
  console.log("Using Upstash Redis");
} else {
  console.log("KV credentials not set, using in-memory store");
}

// Wrapper that tries Redis first, falls back to in-memory
export const kvStore = {
  lpush: async (key: string, ...values: string[]) => {
    if (useRedis) {
      try {
        return await redis.lpush(key, ...values);
      } catch (e) {
        console.error("Redis lpush error, falling back to in-memory:", e);
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
        console.error("Redis lrange error, falling back to in-memory:", e);
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
        console.error("Redis ltrim error, falling back to in-memory:", e);
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
        console.error("Redis incr error, falling back to in-memory:", e);
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
        console.error("Redis hset error, falling back to in-memory:", e);
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
        console.error("Redis hgetall error, falling back to in-memory:", e);
        return inMemoryStore.hgetall(key);
      }
    }
    return inMemoryStore.hgetall(key);
  },
};

export default kvStore;

