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
let vercelKv: any = null;
let kvLoaded = false;

// Lazy load Vercel KV on first use
const initKv = async () => {
  if (kvLoaded) return;
  kvLoaded = true;
  
  if (!process.env.KV_REST_API_URL) {
    console.log("KV_REST_API_URL not set, using in-memory store");
    return;
  }

  try {
    const module = await import("@vercel/kv");
    vercelKv = module.kv;
    console.log("Vercel KV loaded successfully");
  } catch (e) {
    console.warn("Failed to load Vercel KV:", (e as any).message);
  }
};

// Return the appropriate store (KV if available, else in-memory)
const getStore = async () => {
  await initKv();
  return vercelKv || inMemoryStore;
};

export const kvStore = {
  lpush: async (key: string, ...values: string[]) => {
    const store = await getStore();
    return store.lpush(key, ...values);
  },
  lrange: async (key: string, start: number, stop: number) => {
    const store = await getStore();
    return store.lrange(key, start, stop);
  },
  ltrim: async (key: string, start: number, stop: number) => {
    const store = await getStore();
    return store.ltrim(key, start, stop);
  },
  incr: async (key: string) => {
    const store = await getStore();
    return store.incr(key);
  },
  hset: async (key: string, data: Record<string, any>) => {
    const store = await getStore();
    return store.hset(key, data);
  },
  hgetall: async (key: string) => {
    const store = await getStore();
    return store.hgetall(key);
  },
};

export default kvStore;
