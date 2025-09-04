import { ObjectId } from 'mongodb';

export interface CacheEntry {
    _id?: ObjectId;
    key: string; // Unique identifier for the cached data
    data: any; // The cached data
    userId?: number; // Optional user-specific cache
    type: 'api_response' | 'workflow_result' | 'user_data' | 'system_data';
    metadata: {
        endpoint?: string; // API endpoint that was cached
        parameters?: any; // Parameters used for the request
        size?: number; // Size of cached data in bytes
        hits?: number; // Number of times this cache was accessed
    };
    expires_at: Date; // When this cache entry expires
    created_at: Date;
    updated_at: Date;
    last_accessed?: Date;
}

export interface CacheStats {
    total_entries: number;
    total_size: number;
    hit_rate: number;
    expired_entries: number;
}

// Helper functions for cache management
export class CacheService {
    static createCacheKey(endpoint: string, parameters?: any, userId?: number): string {
        const baseKey = `${endpoint}`;
        const paramKey = parameters ? JSON.stringify(parameters) : '';
        const userKey = userId ? `_user_${userId}` : '';
        return `${baseKey}${paramKey}${userKey}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    static createCacheEntry(
        key: string,
        data: any,
        type: CacheEntry['type'],
        ttlMinutes: number = 60,
        userId?: number,
        metadata?: Partial<CacheEntry['metadata']>
    ): CacheEntry {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

        return {
            key,
            data,
            userId,
            type,
            metadata: {
                size: JSON.stringify(data).length,
                hits: 0,
                ...metadata,
            },
            expires_at: expiresAt,
            created_at: now,
            updated_at: now,
        };
    }

    static isExpired(entry: CacheEntry): boolean {
        return new Date() > entry.expires_at;
    }

    static updateHitCount(entry: CacheEntry): CacheEntry {
        return {
            ...entry,
            metadata: {
                ...entry.metadata,
                hits: (entry.metadata.hits || 0) + 1,
            },
            last_accessed: new Date(),
            updated_at: new Date(),
        };
    }

    // Cache TTL configurations for different types
    static getTTL(type: CacheEntry['type']): number {
        switch (type) {
            case 'api_response':
                return 30; // 30 minutes
            case 'workflow_result':
                return 120; // 2 hours
            case 'user_data':
                return 60; // 1 hour
            case 'system_data':
                return 240; // 4 hours
            default:
                return 60; // 1 hour default
        }
    }
}
