// Fallback in-memory store for local development (when KV env vars missing)
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

// Use Vercel KV if available, otherwise fallback to in-memory
export const kvStore = process.env.KV_REST_API_URL
  ? (
    (() => {
      // Lazy load Vercel KV only if env vars exist
      const { kv } = require("@vercel/kv");
      return kv;
    })()
  )
  : inMemoryStore;

export default kvStore;
