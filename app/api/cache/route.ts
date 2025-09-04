import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CacheEntry, CacheService, CacheStats } from '@/lib/models/Cache';

// GET /api/cache?key=cache_key or /api/cache/stats
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');
        const stats = searchParams.get('stats');
        const userId = searchParams.get('userId');

        const db = await getDatabase();
        const collection = db.collection<CacheEntry>('cache');

        // Get cache statistics
        if (stats === 'true') {
            const totalEntries = await collection.countDocuments();
            const expiredEntries = await collection.countDocuments({
                expires_at: { $lt: new Date() }
            });

            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalSize: { $sum: '$metadata.size' },
                        totalHits: { $sum: '$metadata.hits' },
                        totalEntries: { $sum: 1 }
                    }
                }
            ];

            const aggregateResult = await collection.aggregate(pipeline).toArray();
            const stats: CacheStats = {
                total_entries: totalEntries,
                total_size: aggregateResult[0]?.totalSize || 0,
                hit_rate: aggregateResult[0]?.totalHits / Math.max(aggregateResult[0]?.totalEntries, 1) || 0,
                expired_entries: expiredEntries,
            };

            return NextResponse.json({ data: stats });
        }

        // Get specific cache entry
        if (key) {
            const filter: any = { key };
            if (userId) {
                filter.userId = parseInt(userId);
            }

            const entry = await collection.findOne(filter);

            if (!entry) {
                return NextResponse.json(
                    { error: 'Cache entry not found' },
                    { status: 404 }
                );
            }

            // Check if expired
            if (CacheService.isExpired(entry)) {
                // Delete expired entry
                await collection.deleteOne({ _id: entry._id });
                return NextResponse.json(
                    { error: 'Cache entry expired' },
                    { status: 404 }
                );
            }

            // Update hit count
            const updatedEntry = CacheService.updateHitCount(entry);
            await collection.replaceOne({ _id: entry._id }, updatedEntry);

            return NextResponse.json({ data: updatedEntry.data });
        }

        // List cache entries (with pagination)
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (userId) {
            filter.userId = parseInt(userId);
        }

        const entries = await collection
            .find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await collection.countDocuments(filter);

        return NextResponse.json({
            data: entries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching cache:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/cache
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, data, type, ttlMinutes, userId, metadata } = body;

        if (!key || !data || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: key, data, type' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<CacheEntry>('cache');

        // Check if entry already exists
        const filter: any = { key };
        if (userId) {
            filter.userId = parseInt(userId);
        }

        const existing = await collection.findOne(filter);
        if (existing) {
            // Update existing entry
            const updatedEntry = CacheService.createCacheEntry(
                key,
                data,
                type,
                ttlMinutes || CacheService.getTTL(type),
                userId ? parseInt(userId) : undefined,
                metadata
            );

            await collection.replaceOne(filter, updatedEntry);
            return NextResponse.json({ data: updatedEntry });
        }

        // Create new entry
        const entry = CacheService.createCacheEntry(
            key,
            data,
            type,
            ttlMinutes || CacheService.getTTL(type),
            userId ? parseInt(userId) : undefined,
            metadata
        );

        const result = await collection.insertOne(entry);

        return NextResponse.json({
            data: { ...entry, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating cache entry:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/cache?key=cache_key or /api/cache/cleanup
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');
        const cleanup = searchParams.get('cleanup');
        const userId = searchParams.get('userId');

        const db = await getDatabase();
        const collection = db.collection<CacheEntry>('cache');

        // Cleanup expired entries
        if (cleanup === 'true') {
            const result = await collection.deleteMany({
                expires_at: { $lt: new Date() }
            });

            return NextResponse.json({
                message: `Cleaned up ${result.deletedCount} expired cache entries`
            });
        }

        // Delete specific cache entry
        if (key) {
            const filter: any = { key };
            if (userId) {
                filter.userId = parseInt(userId);
            }

            const result = await collection.deleteOne(filter);

            if (result.deletedCount === 0) {
                return NextResponse.json(
                    { error: 'Cache entry not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ message: 'Cache entry deleted successfully' });
        }

        // Clear all cache for user
        if (userId) {
            const result = await collection.deleteMany({ userId: parseInt(userId) });
            return NextResponse.json({
                message: `Deleted ${result.deletedCount} cache entries for user`
            });
        }

        return NextResponse.json(
            { error: 'Key or cleanup parameter required' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error deleting cache:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
