// In-memory cache implementation with TTL support
// Can be swapped for Upstash Redis when configured

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheConfig {
  defaultTTL: number; // milliseconds
  maxEntries: number;
}

// Default TTLs by data type (in milliseconds)
export const CACHE_TTL = {
  database: 5 * 60 * 1000, // 5 minutes - database schema
  rows: 30 * 1000, // 30 seconds - row data (changes frequently)
  workspaces: 10 * 60 * 1000, // 10 minutes - workspaces rarely change
  properties: 5 * 60 * 1000, // 5 minutes - property schemas
  user: 5 * 60 * 1000, // 5 minutes - user data
} as const;

type CacheKey = string;

class MemoryCache {
  private cache: Map<CacheKey, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig = { defaultTTL: 60000, maxEntries: 1000 }) {
    this.config = config;
    this.startCleanup();
  }

  private startCleanup() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }

    // If still too many entries, remove oldest
    if (this.cache.size > this.config.maxEntries) {
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, entries.length - this.config.maxEntries);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
let cacheInstance: MemoryCache | null = null;

export function getCache(): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache({
      defaultTTL: 60000,
      maxEntries: 500,
    });
  }
  return cacheInstance;
}

// Cache key generators
export const cacheKeys = {
  database: (databaseId: string) => `notion:db:${databaseId}`,
  databaseSchema: (databaseId: string) => `notion:schema:${databaseId}`,
  rows: (databaseId: string, cursor?: string) => `notion:rows:${databaseId}:${cursor || "all"}`,
  workspaces: (workspaceId: string) => `notion:workspaces:${workspaceId}`,
  userData: (userId: string) => `user:${userId}`,
};

// Helper to wrap a function with caching
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cache = getCache();
  
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const value = await fn();
  
  // Store in cache
  cache.set(key, value, ttl);
  
  return value;
}
