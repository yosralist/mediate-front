import { NextResponse } from 'next/server';
import { checkConnection, getDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        // Check MongoDB connection
        const isConnected = await checkConnection();

        if (!isConnected) {
            return NextResponse.json(
                {
                    status: 'unhealthy',
                    database: 'disconnected',
                    timestamp: new Date().toISOString(),
                },
                { status: 503 }
            );
        }

        // Get database stats
        const db = await getDatabase();
        const stats = await db.stats();

        // Check collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // Get some basic counts
        const userPrefsCount = collectionNames.includes('user_preferences')
            ? await db.collection('user_preferences').countDocuments()
            : 0;

        const cacheCount = collectionNames.includes('cache')
            ? await db.collection('cache').countDocuments()
            : 0;

        const sessionsCount = collectionNames.includes('sessions')
            ? await db.collection('sessions').countDocuments()
            : 0;

        return NextResponse.json({
            status: 'healthy',
            database: {
                connected: true,
                name: db.databaseName,
                collections: collectionNames,
                stats: {
                    dataSize: stats.dataSize,
                    storageSize: stats.storageSize,
                    indexes: stats.indexes,
                    objects: stats.objects,
                },
                counts: {
                    user_preferences: userPrefsCount,
                    cache: cacheCount,
                    sessions: sessionsCount,
                },
            },
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: {
                node: process.version,
                platform: process.platform,
            },
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                database: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}

// POST endpoint for more detailed health checks
export async function POST() {
    try {
        const db = await getDatabase();

        // Perform write test
        const testCollection = db.collection('health_test');
        const testDoc = {
            test: true,
            timestamp: new Date(),
            random: Math.random(),
        };

        const insertResult = await testCollection.insertOne(testDoc);
        const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
        await testCollection.deleteOne({ _id: insertResult.insertedId });

        if (!findResult) {
            throw new Error('Write/Read test failed');
        }

        // Check for expired cache entries
        const cacheCollection = db.collection('cache');
        const expiredCount = await cacheCollection.countDocuments({
            expires_at: { $lt: new Date() }
        });

        // Check for inactive sessions
        const sessionsCollection = db.collection('sessions');
        const inactiveSessionsCount = await sessionsCollection.countDocuments({
            $or: [
                { isActive: false },
                { expiresAt: { $lt: new Date() } }
            ]
        });

        return NextResponse.json({
            status: 'healthy',
            tests: {
                connection: 'passed',
                write_read: 'passed',
            },
            maintenance: {
                expired_cache_entries: expiredCount,
                inactive_sessions: inactiveSessionsCount,
                cleanup_recommended: expiredCount > 100 || inactiveSessionsCount > 50,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Detailed health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                tests: {
                    connection: 'failed',
                    write_read: 'failed',
                },
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
