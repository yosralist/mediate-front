import { UserPreferences } from '@/lib/models/User';
import { CacheEntry, CacheStats } from '@/lib/models/Cache';

const API_BASE = '/api';

// User Preferences Service
export class UserPreferencesAPI {
    static async get(userId: number): Promise<UserPreferences | null> {
        try {
            const response = await fetch(`${API_BASE}/user-preferences?userId=${userId}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to fetch user preferences');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            return null;
        }
    }

    static async create(
        userId: number,
        username: string,
        email: string,
        institute_id: number
    ): Promise<UserPreferences | null> {
        try {
            const response = await fetch(`${API_BASE}/user-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username, email, institute_id }),
            });
            if (!response.ok) throw new Error('Failed to create user preferences');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating user preferences:', error);
            return null;
        }
    }

    static async update(
        userId: number,
        preferences: Partial<UserPreferences['preferences']>
    ): Promise<UserPreferences | null> {
        try {
            const response = await fetch(`${API_BASE}/user-preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, preferences }),
            });
            if (!response.ok) throw new Error('Failed to update user preferences');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return null;
        }
    }

    static async delete(userId: number): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/user-preferences?userId=${userId}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting user preferences:', error);
            return false;
        }
    }
}

// Cache Service
export class CacheAPI {
    static async get(key: string, userId?: number): Promise<any | null> {
        try {
            const params = new URLSearchParams({ key });
            if (userId) params.append('userId', userId.toString());

            const response = await fetch(`${API_BASE}/cache?${params}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to fetch cache');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching cache:', error);
            return null;
        }
    }

    static async set(
        key: string,
        data: any,
        type: CacheEntry['type'],
        ttlMinutes?: number,
        userId?: number,
        metadata?: any
    ): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, data, type, ttlMinutes, userId, metadata }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error setting cache:', error);
            return false;
        }
    }

    static async delete(key: string, userId?: number): Promise<boolean> {
        try {
            const params = new URLSearchParams({ key });
            if (userId) params.append('userId', userId.toString());

            const response = await fetch(`${API_BASE}/cache?${params}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting cache:', error);
            return false;
        }
    }

    static async getStats(): Promise<CacheStats | null> {
        try {
            const response = await fetch(`${API_BASE}/cache?stats=true`);
            if (!response.ok) throw new Error('Failed to fetch cache stats');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching cache stats:', error);
            return null;
        }
    }

    static async cleanup(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/cache?cleanup=true`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error cleaning up cache:', error);
            return false;
        }
    }
}

// Health Check Service
export class HealthAPI {
    static async check(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking health:', error);
            return { status: 'unhealthy', error: 'Connection failed' };
        }
    }

    static async detailedCheck(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE}/health`, { method: 'POST' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error performing detailed health check:', error);
            return { status: 'unhealthy', error: 'Connection failed' };
        }
    }
}

// Utility functions for caching API responses
export class APICache {
    static createKey(endpoint: string, params?: any, userId?: number): string {
        const baseKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
        const paramKey = params ? `_${JSON.stringify(params).replace(/[^a-zA-Z0-9]/g, '_')}` : '';
        const userKey = userId ? `_user_${userId}` : '';
        return `${baseKey}${paramKey}${userKey}`;
    }

    static async getCachedResponse(
        endpoint: string,
        params?: any,
        userId?: number
    ): Promise<any | null> {
        const key = this.createKey(endpoint, params, userId);
        return await CacheAPI.get(key, userId);
    }

    static async setCachedResponse(
        endpoint: string,
        data: any,
        params?: any,
        userId?: number,
        ttlMinutes?: number
    ): Promise<boolean> {
        const key = this.createKey(endpoint, params, userId);
        return await CacheAPI.set(
            key,
            data,
            'api_response',
            ttlMinutes,
            userId,
            { endpoint, parameters: params }
        );
    }

    // Wrapper for API calls with caching
    static async fetchWithCache<T>(
        endpoint: string,
        options: RequestInit = {},
        cacheOptions: {
            userId?: number;
            ttlMinutes?: number;
            useCache?: boolean;
            params?: any;
        } = {}
    ): Promise<T | null> {
        const { userId, ttlMinutes = 30, useCache = true, params } = cacheOptions;

        // Try to get from cache first
        if (useCache) {
            const cached = await this.getCachedResponse(endpoint, params, userId);
            if (cached) {
                return cached;
            }
        }

        try {
            // Fetch from API
            const response = await fetch(endpoint, options);
            if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);

            const data = await response.json();

            // Cache the response
            if (useCache) {
                await this.setCachedResponse(endpoint, data, params, userId, ttlMinutes);
            }

            return data;
        } catch (error) {
            console.error('API call failed:', error);
            return null;
        }
    }
}
