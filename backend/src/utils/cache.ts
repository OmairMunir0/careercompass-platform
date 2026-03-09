import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis";

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
};

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|");
  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached(key: string, data: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Delete cached data by key
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

/**
 * Delete cached data by pattern (e.g., "posts:*")
 */
export async function deleteCachedByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
}

/**
 * Cache middleware for Express routes
 */
export function cacheMiddleware(ttl: number = CACHE_TTL.MEDIUM, keyPrefix?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Generate cache key
    const prefix = keyPrefix || req.path;
    const cacheKey = generateCacheKey(prefix, {
      ...req.query,
      ...req.params,
    });

    try {
      // Try to get from cache
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (body: any) {
        // Cache the response
        setCached(cacheKey, body, ttl).catch((err) => {
          console.error("Error caching response:", err);
        });
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
}

/**
 * Invalidate cache for a specific resource
 */
export async function invalidateCache(patterns: string[]): Promise<void> {
  try {
    await Promise.all(patterns.map((pattern) => deleteCachedByPattern(pattern)));
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

